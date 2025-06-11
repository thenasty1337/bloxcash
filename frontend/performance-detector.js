#!/usr/bin/env node

/**
 * Custom Performance Detector
 * Scans source code for expensive operations and performance anti-patterns
 */

const fs = require('fs');
const path = require('path');

class PerformanceDetector {
  constructor() {
    this.issues = [];
    this.expensivePatterns = [
      // DOM manipulation patterns
      {
        pattern: /document\.querySelector.*\)/g,
        severity: 'medium',
        message: 'Direct DOM queries in render loops can be expensive',
        suggestion: 'Consider using refs or caching the query result'
      },
      
      // Animation patterns
      {
        pattern: /setInterval|setTimeout.*animation/gi,
        severity: 'high',
        message: 'Timer-based animations are expensive',
        suggestion: 'Use requestAnimationFrame or CSS animations instead'
      },
      
      // Large loop patterns
      {
        pattern: /\.map\(.*\.map\(/g,
        severity: 'high',
        message: 'Nested .map() calls create nested loops',
        suggestion: 'Consider flattening or optimizing the data structure'
      },
      
      // Expensive DOM operations
      {
        pattern: /\.innerHTML\s*=/g,
        severity: 'medium',
        message: 'innerHTML assignments trigger expensive reflows',
        suggestion: 'Use textContent or DOM methods for better performance'
      },
      
      // Style recalculation triggers
      {
        pattern: /\.style\.\w+\s*=/g,
        severity: 'medium',
        message: 'Direct style modifications trigger style recalculation',
        suggestion: 'Use CSS classes or CSS-in-JS for better performance'
      },
      
      // Memory leak patterns
      {
        pattern: /addEventListener.*(?!removeEventListener)/g,
        severity: 'medium',
        message: 'Event listener without cleanup can cause memory leaks',
        suggestion: 'Ensure removeEventListener is called in cleanup'
      },
      
      // Large array operations
      {
        pattern: /\.\w+\(\)\.filter\(\)\.map\(\)/g,
        severity: 'medium',
        message: 'Chained array operations create multiple iterations',
        suggestion: 'Consider combining operations or using a single reduce()'
      },
      
      // Regular expression compilation
      {
        pattern: /new RegExp\(/g,
        severity: 'low',
        message: 'Runtime regex compilation is expensive',
        suggestion: 'Use regex literals (/pattern/) when possible'
      },

      // Timer-based operations (setInterval/setTimeout for animations)
      {
        pattern: /setInterval\s*\(\s*.*\s*,\s*\d+\s*\)/g,
        severity: 'high', 
        message: 'setInterval for animations causes style recalculation',
        suggestion: 'Use requestAnimationFrame for smooth 60fps animations'
      }
    ];
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      this.expensivePatterns.forEach(({ pattern, severity, message, suggestion }) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = lines[lineNumber - 1];
          
          this.issues.push({
            file: filePath,
            line: lineNumber,
            severity,
            message,
            suggestion,
            code: line.trim()
          });
        }
      });
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        this.scanFile(filePath);
      }
    });
  }

  generateReport() {
    if (this.issues.length === 0) {
      console.log('✅ No performance issues detected!');
      return;
    }

    console.log(`\n🔍 Performance Issues Detected: ${this.issues.length}\n`);
    
    const severityColors = {
      high: '\x1b[31m',    // Red
      medium: '\x1b[33m',  // Yellow
      low: '\x1b[36m'      // Cyan
    };
    
    const reset = '\x1b[0m';
    
    this.issues.forEach((issue, index) => {
      const color = severityColors[issue.severity] || '';
      console.log(`${index + 1}. ${color}[${issue.severity.toUpperCase()}]${reset} ${issue.file}:${issue.line}`);
      console.log(`   Problem: ${issue.message}`);
      console.log(`   Suggestion: ${issue.suggestion}`);
      console.log(`   Code: ${issue.code}`);
      console.log('');
    });

    // Summary
    const summary = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Summary:');
    Object.entries(summary).forEach(([severity, count]) => {
      const color = severityColors[severity] || '';
      console.log(`   ${color}${severity}: ${count} issues${reset}`);
    });
  }
}

// Run the detector
const detector = new PerformanceDetector();

// Scan the src directory
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  detector.scanDirectory(srcDir);
  detector.generateReport();
} else {
  console.error('src directory not found. Run this script from your frontend directory.');
}

module.exports = PerformanceDetector; 