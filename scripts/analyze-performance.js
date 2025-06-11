#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing SolidJS performance anti-patterns...\n');

const FRONTEND_DIR = path.join(__dirname, '../frontend/src');
const PERFORMANCE_ISSUES = [];

// Common anti-patterns to look for
const ANTI_PATTERNS = {
  'Unnecessary re-renders': {
    patterns: [
      /createSignal\(\[\]/g,  // Creating signal with array literal
      /createSignal\(\{\}/g,  // Creating signal with object literal
      /\.map\([^)]*\)/g,      // Array.map in JSX (should use <For>)
      /Object\.keys\([^)]*\)\.map/g, // Object.keys().map pattern
    ],
    severity: 'medium',
    description: 'Components that might cause unnecessary re-renders'
  },
  'Memory leaks': {
    patterns: [
      /setInterval\(/g,       // setInterval without cleanup
      /addEventListener\(/g,  // Event listeners without cleanup
      /new\s+WebSocket/g,     // WebSocket without cleanup
      /new\s+EventSource/g,   // EventSource without cleanup
    ],
    severity: 'high',
    description: 'Potential memory leaks from uncleaned resources'
  },
  'Heavy computations': {
    patterns: [
      /JSON\.parse\(/g,       // JSON parsing in render
      /JSON\.stringify\(/g,   // JSON stringifying in render
      /\.filter\([^)]*\)\.map/g, // Filter + map chain
      /\.sort\(/g,            // Array sorting (potentially in render)
    ],
    severity: 'medium',
    description: 'Heavy computations that should be memoized'
  },
  'Large data structures': {
    patterns: [
      /\[\.\.\.[^,\]]{50,}\]/g, // Large spread operations
      /new\s+Array\(\d{3,}\)/g,  // Large array creation
    ],
    severity: 'low',
    description: 'Large data structures that might impact performance'
  },
  'Animation issues': {
    patterns: [
      /animation:\s*[^;]*infinite/g, // Infinite animations
      /setInterval\([^,]*,\s*\d+\)/g, // Short interval timers
      /requestAnimationFrame/g,       // RAF usage (check for cleanup)
    ],
    severity: 'medium',
    description: 'Animation patterns that might impact performance'
  }
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(FRONTEND_DIR, filePath);
  const issues = [];

  // Check each anti-pattern
  Object.entries(ANTI_PATTERNS).forEach(([category, config]) => {
    config.patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          const lineNumber = lines.length;
          
          issues.push({
            file: relativePath,
            line: lineNumber,
            category,
            severity: config.severity,
            description: config.description,
            code: match,
            context: lines[lines.length - 1]
          });
        });
      }
    });
  });

  return issues;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      const issues = analyzeFile(filePath);
      PERFORMANCE_ISSUES.push(...issues);
    }
  });
}

function categorizeIssues() {
  const categorized = {};
  
  PERFORMANCE_ISSUES.forEach(issue => {
    if (!categorized[issue.category]) {
      categorized[issue.category] = [];
    }
    categorized[issue.category].push(issue);
  });
  
  return categorized;
}

function printResults() {
  const categorized = categorizeIssues();
  const totalIssues = PERFORMANCE_ISSUES.length;
  
  console.log(`📊 Found ${totalIssues} potential performance issues:\n`);
  
  // Summary by severity
  const severityCounts = {
    high: PERFORMANCE_ISSUES.filter(i => i.severity === 'high').length,
    medium: PERFORMANCE_ISSUES.filter(i => i.severity === 'medium').length,
    low: PERFORMANCE_ISSUES.filter(i => i.severity === 'low').length
  };
  
  console.log('🚨 Severity Summary:');
  console.log(`   High:   ${severityCounts.high} issues`);
  console.log(`   Medium: ${severityCounts.medium} issues`);
  console.log(`   Low:    ${severityCounts.low} issues\n`);
  
  // Detailed results by category
  Object.entries(categorized).forEach(([category, issues]) => {
    console.log(`\n📁 ${category.toUpperCase()} (${issues.length} issues):`);
    console.log(`   ${ANTI_PATTERNS[category].description}\n`);
    
    // Group by file
    const byFile = {};
    issues.forEach(issue => {
      if (!byFile[issue.file]) byFile[issue.file] = [];
      byFile[issue.file].push(issue);
    });
    
    Object.entries(byFile).forEach(([file, fileIssues]) => {
      console.log(`   📄 ${file}:`);
      fileIssues.forEach(issue => {
        const severityIcon = issue.severity === 'high' ? '🔴' : 
                           issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`      ${severityIcon} Line ${issue.line}: ${issue.code}`);
      });
      console.log('');
    });
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:\n');
  
  if (severityCounts.high > 0) {
    console.log('🚨 HIGH PRIORITY:');
    console.log('   • Fix memory leaks by adding proper cleanup in onCleanup()');
    console.log('   • Remove or optimize infinite animations');
    console.log('   • Ensure all event listeners are properly removed\n');
  }
  
  if (severityCounts.medium > 0) {
    console.log('⚠️  MEDIUM PRIORITY:');
    console.log('   • Wrap heavy computations in createMemo()');
    console.log('   • Replace .map() in JSX with <For> component');
    console.log('   • Consider virtualizing large lists');
    console.log('   • Optimize animation frame usage\n');
  }
  
  console.log('🔧 PERFORMANCE TIPS:');
  console.log('   • Use the performance profiler we just added to your home page');
  console.log('   • Run the app and check the performance panel in development');
  console.log('   • Look for components taking >16ms to render');
  console.log('   • Monitor FPS - it should stay above 30fps\n');
  
  console.log('🎯 FOCUS AREAS for home.jsx:');
  console.log('   • SlotsList components (multiple instances)');
  console.log('   • Crypto carousel animation');
  console.log('   • GamesList with responsive images');
  console.log('   • BannerCarousel component\n');
}

// Main execution
if (fs.existsSync(FRONTEND_DIR)) {
  scanDirectory(FRONTEND_DIR);
  printResults();
} else {
  console.error('❌ Frontend directory not found:', FRONTEND_DIR);
  console.log('Please run this script from the project root directory.');
} 