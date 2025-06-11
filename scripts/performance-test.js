const { execSync, spawn } = require('child_process');
const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function run() {
  const frontendDir = path.join(__dirname, '..', 'frontend');

  try {
    console.log('\x1b[36m%s\x1b[0m', '⏳ Building frontend…');
    execSync('bun run build', { cwd: frontendDir, stdio: 'inherit' });

    console.log('\x1b[36m%s\x1b[0m', '🚀 Starting preview server…');
    const preview = spawn('bun', ['run', 'serve', '--', '--strictPort'], {
      cwd: frontendDir,
      stdio: 'inherit',
      shell: true
    });

    // Wait for the preview server to start (adjust if your build is slower)
    await new Promise((res) => setTimeout(res, 8000));

    console.log('\x1b[36m%s\x1b[0m', '🛰  Launching headless Chrome…');
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = { port: chrome.port, output: 'html' };

    console.log('\x1b[36m%s\x1b[0m', '📊 Running Lighthouse…');
    const runnerResult = await lighthouse('http://localhost:4173', options);

    const reportPath = path.join(__dirname, '..', 'lighthouse-report.html');
    fs.writeFileSync(reportPath, runnerResult.report);

    console.log('\x1b[32m%s\x1b[0m', `✔ Performance score: ${
      runnerResult.lhr.categories.performance.score * 100
    }`);
    console.log('\x1b[32m%s\x1b[0m', `📄 Report saved to ${reportPath}`);

    await chrome.kill();
    preview.kill('SIGINT');
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Performance test failed');
    console.error(err);
    process.exitCode = 1;
  }
}

run(); 