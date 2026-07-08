/**
 * Webman 后端服务压力测试工具
 * 基于 Node.js 异步 HTTP 请求实现
 * 
 * 测试维度：
 * 1. 基准响应时间测试
 * 2. 并发递增测试（10/50/100/200/500/1000）
 * 3. 持续负载稳定性测试
 * 4. 系统资源监控
 */

import http from 'http';
import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

// ============================================================
// 配置
// ============================================================
const BASE_URL = 'http://127.0.0.1:39120';
const REQUEST_TIMEOUT = 10000; // 10秒超时

// 测试端点定义
const ENDPOINTS = {
    config: {
        name: '站点配置',
        path: '/app/xbMovieApp/api/Config/index',
        method: 'GET',
        category: '无DB查询',
    },
    assetList: {
        name: '资产列表',
        path: '/app/xbAiAsset/api/Asset/list?page=1&limit=10',
        method: 'GET',
        category: 'DB分页查询',
    },
    assetListFiltered: {
        name: '资产列表(带筛选)',
        path: '/app/xbAiAsset/api/Asset/list?page=1&limit=10&type=20',
        method: 'GET',
        category: 'DB条件查询',
    },
    marketList: {
        name: '市场列表',
        path: '/app/xbAiAsset/api/Market/list?page=1&limit=10',
        method: 'GET',
        category: 'DB分页查询',
    },
    hotTags: {
        name: '热门标签',
        path: '/app/xbAiAsset/api/Tag/hotList',
        method: 'GET',
        category: 'DB查询',
    },
    helpList: {
        name: '帮助文章',
        path: '/app/xbHelp/api/Article/list?page=1&limit=10',
        method: 'GET',
        category: 'DB分页查询',
    },
};

// ============================================================
// 工具函数
// ============================================================

function percentile(sortedArr, p) {
    if (sortedArr.length === 0) return 0;
    const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, Math.min(idx, sortedArr.length - 1))];
}

function formatMs(ms) {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    return `${ms.toFixed(2)}ms`;
}

function getSystemResources() {
    try {
        const pid = execSync('powershell -Command "(Get-NetTCPConnection -LocalPort 39120 -ErrorAction SilentlyContinue).OwningProcess"').toString().trim();
        const cpuInfo = execSync('powershell -Command "Get-Process -Id ' + pid + ' -ErrorAction SilentlyContinue | Select-Object CPU,WorkingSet64,Threads | Format-List"').toString();
        
        const totalCPU = execSync('powershell -Command "(Get-Counter \'\\Processor(_Total)\\% Processor Time\' -ErrorAction SilentlyContinue).CounterSamples.CookedValue"').toString().trim();
        
        const totalMem = execSync('powershell -Command "$os = Get-CimInstance Win32_OperatingSystem; [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1024, 1)"').toString().trim();
        
        // 解析进程信息
        const cpuMatch = cpuInfo.match(/CPU\s*:\s*([\d.]+)/);
        const memMatch = cpuInfo.match(/WorkingSet64\s*:\s*(\d+)/);
        
        return {
            processCPU: cpuMatch ? parseFloat(cpuMatch[1]) : 0,
            processMemory: memMatch ? Math.round(parseInt(memMatch[1]) / 1024 / 1024) : 0,
            systemCPU: parseFloat(totalCPU) || 0,
            usedMemory: parseFloat(totalMem) || 0,
            pid: pid,
        };
    } catch (e) {
        return { processCPU: 0, processMemory: 0, systemCPU: 0, usedMemory: 0, pid: 'N/A' };
    }
}

// ============================================================
// HTTP 请求封装
// ============================================================

function makeRequest(path, method = 'GET') {
    return new Promise((resolve) => {
        const startTime = performance.now();
        const options = {
            hostname: '127.0.0.1',
            port: 39120,
            path: path,
            method: method,
            timeout: REQUEST_TIMEOUT,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'StressTest/1.0',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const elapsed = performance.now() - startTime;
                resolve({
                    success: res.statusCode === 200,
                    statusCode: res.statusCode,
                    elapsed: elapsed,
                    responseSize: data.length,
                    error: null,
                });
            });
        });

        req.on('timeout', () => {
            req.destroy();
            const elapsed = performance.now() - startTime;
            resolve({
                success: false,
                statusCode: 0,
                elapsed: elapsed,
                responseSize: 0,
                error: 'timeout',
            });
        });

        req.on('error', (err) => {
            const elapsed = performance.now() - startTime;
            resolve({
                success: false,
                statusCode: 0,
                elapsed: elapsed,
                responseSize: 0,
                error: err.code || err.message,
            });
        });

        req.end();
    });
}

// ============================================================
// 并发压力测试核心
// ============================================================

async function stressTest(endpoint, concurrency, durationMs, label = '') {
    const results = [];
    const errors = { timeout: 0, connection: 0, http: 0 };
    let totalRequests = 0;
    let successRequests = 0;
    let failedRequests = 0;
    const startTime = performance.now();
    const endTime = startTime + durationMs;
    
    // 记录每秒的QPS
    const qpsHistory = [];
    let secondStart = startTime;
    let secondCount = 0;

    // 资源监控间隔
    let lastResourceCheck = startTime;
    const resourceHistory = [];

    async function worker() {
        while (performance.now() < endTime) {
            const result = await makeRequest(endpoint.path, endpoint.method);
            results.push(result.elapsed);
            totalRequests++;
            secondCount++;

            if (result.success) {
                successRequests++;
            } else {
                failedRequests++;
                if (result.error === 'timeout') errors.timeout++;
                else if (result.error === 'ECONNRESET' || result.error === 'ECONNREFUSED' || result.error === 'EPIPE') errors.connection++;
                else if (result.statusCode > 0 && result.statusCode !== 200) errors.http++;
            }

            // 每秒记录QPS
            const now = performance.now();
            if (now - secondStart >= 1000) {
                qpsHistory.push({
                    second: Math.floor((now - startTime) / 1000),
                    qps: secondCount,
                });
                secondCount = 0;
                secondStart = now;
            }

            // 每5秒记录资源
            if (now - lastResourceCheck >= 5000) {
                resourceHistory.push({
                    time: Math.floor((now - startTime) / 1000),
                    ...getSystemResources(),
                });
                lastResourceCheck = now;
            }
        }
    }

    // 启动并发 workers
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
        workers.push(worker());
    }
    await Promise.all(workers);

    const actualDuration = performance.now() - startTime;
    
    // 排序用于百分位计算
    const sortedTimes = results.filter(r => r > 0).sort((a, b) => a - b);
    
    const stats = {
        label: label || `${concurrency}并发`,
        endpoint: endpoint.name,
        path: endpoint.path,
        concurrency: concurrency,
        duration: actualDuration,
        totalRequests: totalRequests,
        successRequests: successRequests,
        failedRequests: failedRequests,
        errorRate: totalRequests > 0 ? (failedRequests / totalRequests * 100).toFixed(2) + '%' : '0%',
        qps: (totalRequests / (actualDuration / 1000)).toFixed(1),
        avgTime: sortedTimes.length > 0 ? sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length : 0,
        minTime: sortedTimes.length > 0 ? sortedTimes[0] : 0,
        maxTime: sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0,
        p50: percentile(sortedTimes, 50),
        p90: percentile(sortedTimes, 90),
        p95: percentile(sortedTimes, 95),
        p99: percentile(sortedTimes, 99),
        errors: errors,
        qpsHistory: qpsHistory,
        resourceHistory: resourceHistory,
    };

    return stats;
}

// ============================================================
// 基准测试（单请求）
// ============================================================

async function baselineTest() {
    console.log('\n' + '='.repeat(80));
    console.log('  基准测试 — 单请求响应时间');
    console.log('='.repeat(80));
    console.log();

    const results = [];
    
    for (const [key, endpoint] of Object.entries(ENDPOINTS)) {
        // 每个端点测试3次取平均
        const times = [];
        let lastStatus = 0;
        let lastSize = 0;
        
        for (let i = 0; i < 3; i++) {
            const result = await makeRequest(endpoint.path, endpoint.method);
            if (result.success) {
                times.push(result.elapsed);
                lastStatus = result.statusCode;
                lastSize = result.responseSize;
            } else {
                times.push(result.elapsed);
                lastStatus = result.statusCode;
                lastSize = 0;
            }
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        
        results.push({
            name: endpoint.name,
            path: endpoint.path,
            category: endpoint.category,
            status: lastStatus,
            avgTime: avgTime,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
            responseSize: lastSize,
        });

        console.log(`  [${endpoint.name}] ${endpoint.path}`);
        console.log(`    类别: ${endpoint.category} | 状态: ${lastStatus} | 响应大小: ${(lastSize / 1024).toFixed(2)}KB`);
        console.log(`    平均: ${formatMs(avgTime)} | 最小: ${formatMs(Math.min(...times))} | 最大: ${formatMs(Math.max(...times))}`);
        console.log();
    }

    return results;
}

// ============================================================
// 并发递增测试
// ============================================================

async function concurrencyRampTest() {
    console.log('\n' + '='.repeat(80));
    console.log('  并发递增测试 — 逐步增加并发用户数');
    console.log('  测试时长: 每个并发级别 15 秒');
    console.log('='.repeat(80));

    const concurrencyLevels = [10, 50, 100, 200, 500, 1000];
    const testDuration = 15000; // 15秒
    const allResults = [];

    // 使用资产列表作为主要测试端点（涉及DB查询，具有代表性）
    const testEndpoint = ENDPOINTS.assetList;
    
    console.log(`\n  测试端点: [${testEndpoint.name}] ${testEndpoint.path}`);
    console.log(`  并发级别: ${concurrencyLevels.join(' → ')}`);
    console.log();

    for (const concurrency of concurrencyLevels) {
        console.log(`  ▶ 正在测试 ${concurrency} 并发用户... (持续 ${testDuration / 1000}s)`);
        
        const beforeResource = getSystemResources();
        const result = await stressTest(testEndpoint, concurrency, testDuration, `${concurrency}并发`);
        const afterResource = getSystemResources();
        
        allResults.push(result);

        console.log(`    ✓ 总请求: ${result.totalRequests} | 成功: ${result.successRequests} | 失败: ${result.failedRequests}`);
        console.log(`    ✓ QPS: ${result.qps} | 错误率: ${result.errorRate}`);
        console.log(`    ✓ 响应时间 — 平均: ${formatMs(result.avgTime)} | P50: ${formatMs(result.p50)} | P95: ${formatMs(result.p95)} | P99: ${formatMs(result.p99)}`);
        console.log(`    ✓ 进程内存: ${beforeResource.processMemory}MB → ${afterResource.processMemory}MB | 系统CPU: ${afterResource.systemCPU.toFixed(1)}%`);
        
        if (result.failedRequests > 0) {
            console.log(`    ⚠ 错误明细: 超时=${result.errors.timeout} 连接=${result.errors.connection} HTTP=${result.errors.http}`);
        }
        console.log();

        // 如果错误率超过20%，停止递增
        if (parseFloat(result.errorRate) > 20) {
            console.log(`  ⛔ 错误率超过20%，停止递增测试`);
            break;
        }
    }

    return allResults;
}

// ============================================================
// 多端点并发对比测试
// ============================================================

async function multiEndpointTest(concurrency = 100, duration = 20000) {
    console.log('\n' + '='.repeat(80));
    console.log(`  多端点对比测试 — ${concurrency}并发 / ${duration / 1000}秒`);
    console.log('='.repeat(80));
    console.log();

    const testEndpoints = ['config', 'assetList', 'assetListFiltered', 'marketList', 'hotTags', 'helpList'];
    const results = [];

    for (const key of testEndpoints) {
        const endpoint = ENDPOINTS[key];
        console.log(`  ▶ 测试 [${endpoint.name}] ...`);
        
        const result = await stressTest(endpoint, concurrency, duration, endpoint.name);
        results.push({ ...result, endpointKey: key });

        console.log(`    ✓ QPS: ${result.qps} | 平均: ${formatMs(result.avgTime)} | P95: ${formatMs(result.p95)} | P99: ${formatMs(result.p99)} | 错误率: ${result.errorRate}`);
        console.log();
    }

    return results;
}

// ============================================================
// 持续负载稳定性测试
// ============================================================

async function stabilityTest(concurrency = 100, duration = 60000) {
    console.log('\n' + '='.repeat(80));
    console.log(`  持续负载稳定性测试 — ${concurrency}并发 / ${duration / 1000}秒`);
    console.log('='.repeat(80));
    console.log();

    const testEndpoint = ENDPOINTS.assetList;
    console.log(`  测试端点: [${testEndpoint.name}] ${testEndpoint.path}`);
    console.log();

    const beforeResource = getSystemResources();
    console.log(`  测试前资源状态: 进程内存=${beforeResource.processMemory}MB, 系统CPU=${beforeResource.systemCPU.toFixed(1)}%, PID=${beforeResource.pid}`);
    console.log();

    const result = await stressTest(testEndpoint, concurrency, duration, `稳定性${concurrency}并发`);

    const afterResource = getSystemResources();
    
    console.log(`\n  ========== 稳定性测试结果 ==========`);
    console.log(`  总请求: ${result.totalRequests}`);
    console.log(`  成功: ${result.successRequests} | 失败: ${result.failedRequests} | 错误率: ${result.errorRate}`);
    console.log(`  平均QPS: ${result.qps}`);
    console.log(`  响应时间 — 平均: ${formatMs(result.avgTime)} | P50: ${formatMs(result.p50)} | P90: ${formatMs(result.p90)} | P95: ${formatMs(result.p95)} | P99: ${formatMs(result.p99)}`);
    console.log(`  响应时间 — 最小: ${formatMs(result.minTime)} | 最大: ${formatMs(result.maxTime)}`);
    console.log();

    // QPS 趋势
    if (result.qpsHistory.length > 0) {
        console.log(`  QPS 逐秒趋势 (前10秒/后10秒):`);
        const first10 = result.qpsHistory.slice(0, 10);
        const last10 = result.qpsHistory.slice(-10);
        console.log(`    前10秒: ${first10.map(h => h.qps).join(', ')}`);
        console.log(`    后10秒: ${last10.map(h => h.qps).join(', ')}`);
        const avgFirst = first10.reduce((a, b) => a + b.qps, 0) / first10.length;
        const avgLast = last10.reduce((a, b) => a + b.qps, 0) / last10.length;
        const decline = ((avgFirst - avgLast) / avgFirst * 100).toFixed(1);
        console.log(`    前10秒平均QPS: ${avgFirst.toFixed(1)} → 后10秒平均QPS: ${avgLast.toFixed(1)} (变化: ${decline}%)`);
        console.log();
    }

    // 内存趋势
    if (result.resourceHistory.length > 0) {
        console.log(`  内存使用趋势:`);
        result.resourceHistory.forEach(h => {
            console.log(`    ${h.time}s: 进程内存=${h.processMemory}MB, 系统CPU=${h.systemCPU.toFixed(1)}%`);
        });
        console.log();
        const memGrowth = result.resourceHistory[result.resourceHistory.length - 1].processMemory - result.resourceHistory[0].processMemory;
        console.log(`  内存增长: ${result.resourceHistory[0].processMemory}MB → ${result.resourceHistory[result.resourceHistory.length - 1].processMemory}MB (增长 ${memGrowth}MB)`);
    }

    console.log();
    return result;
}

// ============================================================
// 主执行流程
// ============================================================

async function main() {
    const totalStart = performance.now();
    
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(20) + 'Webman 后端服务压力测试报告' + ' '.repeat(30) + '║');
    console.log('╠' + '═'.repeat(78) + '╣');
    
    // 系统信息
    const sysInfo = getSystemResources();
    console.log(`║  服务器地址: http://127.0.0.1:39120` + ' '.repeat(49) + '║');
    console.log(`║  PHP版本: 8.2.20 (NTS)` + ' '.repeat(55) + '║');
    console.log(`║  框架: Webman (Workerman)` + ' '.repeat(53) + '║');
    console.log(`║  数据库: MySQL (ThinkORM, 连接池max=5)` + ' '.repeat(39) + '║');
    console.log(`║  缓存: File` + ' '.repeat(66) + '║');
    console.log(`║  Session: File` + ' '.repeat(62) + '║');
    console.log(`║  进程PID: ${sysInfo.pid}` + ' '.repeat(62) + '║');
    console.log(`║  系统CPU核心: 12` + ' '.repeat(60) + '║');
    console.log(`║  系统内存: 15.83 GB` + ' '.repeat(56) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');

    // 阶段1: 基准测试
    console.log('\n\n【阶段 1/4】基准响应时间测试');
    const baselineResults = await baselineTest();

    // 阶段2: 并发递增测试
    console.log('\n\n【阶段 2/4】并发递增测试');
    const rampResults = await concurrencyRampTest();

    // 阶段3: 多端点对比测试
    console.log('\n\n【阶段 3/4】多端点对比测试 (100并发 / 20秒)');
    const multiResults = await multiEndpointTest(100, 20000);

    // 阶段4: 持续负载稳定性测试
    console.log('\n\n【阶段 4/4】持续负载稳定性测试 (100并发 / 60秒)');
    const stabilityResults = await stabilityTest(100, 60000);

    // 汇总报告
    const totalTime = ((performance.now() - totalStart) / 1000).toFixed(1);
    console.log('\n\n');
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(25) + '压力测试完成 — 汇总摘要' + ' '.repeat(26) + '║');
    console.log('╠' + '═'.repeat(78) + '╣');
    console.log(`║  总测试时长: ${totalTime}秒` + ' '.repeat(60) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');

    // 输出JSON结果用于分析
    const fullReport = {
        testTime: new Date().toISOString(),
        totalTime: totalTime,
        systemInfo: {
            php: '8.2.20',
            framework: 'Webman (Workerman)',
            database: 'MySQL (ThinkORM, pool max=5)',
            cache: 'File',
            session: 'File',
            cpuCores: 12,
            ram: '15.83 GB',
            pid: sysInfo.pid,
        },
        baseline: baselineResults,
        concurrencyRamp: rampResults,
        multiEndpoint: multiResults,
        stability: stabilityResults,
    };

    // 写入JSON报告文件
    const fs = await import('fs');
    const reportPath = 'd:/wwwroot/jymc.dev/server/stress-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2), 'utf-8');
    console.log(`\n  完整JSON报告已保存至: ${reportPath}`);
}

main().catch(err => {
    console.error('测试执行出错:', err);
    process.exit(1);
});
