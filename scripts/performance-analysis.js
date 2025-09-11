#!/usr/bin/env node
/**
 * Performance Analysis Script for Lunar Sleep App
 * Analyzes bundle size, component complexity, and performance bottlenecks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ANALYSIS_OUTPUT = path.join(PROJECT_ROOT, 'performance-report.json');

// Performance thresholds
const THRESHOLDS = {
  MAX_COMPONENT_LINES: 500,
  MAX_HOOKS_PER_COMPONENT: 10,
  MAX_BUNDLE_SIZE_MB: 10,
  MAX_DEPENDENCIES: 50,
  CRITICAL_ANIMATION_COUNT: 20
};

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      bundleAnalysis: {},
      componentAnalysis: [],
      dependencyAnalysis: {},
      animationAnalysis: {},
      recommendations: []
    };
  }

  // Analyze TypeScript/JavaScript files for performance metrics
  analyzeComponents() {
    console.log('🔍 Analyzing component complexity...');
    
    const componentFiles = this.findFiles(['.tsx', '.ts'], ['node_modules', '.expo']);
    
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      
      const analysis = {
        file: relativePath,
        lines: content.split('\n').length,
        hooks: this.countHooks(content),
        animations: this.countAnimations(content),
        complexRendering: this.checkComplexRendering(content),
        memoryRisks: this.checkMemoryRisks(content)
      };
      
      this.results.componentAnalysis.push(analysis);
      
      // Generate recommendations
      if (analysis.lines > THRESHOLDS.MAX_COMPONENT_LINES) {
        this.results.recommendations.push({
          type: 'HIGH',
          component: relativePath,
          issue: 'Component too large',
          description: `${analysis.lines} lines (max recommended: ${THRESHOLDS.MAX_COMPONENT_LINES})`,
          solution: 'Split into smaller components or use code splitting'
        });
      }
      
      if (analysis.hooks > THRESHOLDS.MAX_HOOKS_PER_COMPONENT) {
        this.results.recommendations.push({
          type: 'MEDIUM',
          component: relativePath,
          issue: 'Too many hooks',
          description: `${analysis.hooks} hooks detected`,
          solution: 'Consider custom hooks or component splitting'
        });
      }
    });
  }

  // Count React hooks usage
  countHooks(content) {
    const hookPatterns = [
      /useState\s*\(/g,
      /useEffect\s*\(/g,
      /useCallback\s*\(/g,
      /useMemo\s*\(/g,
      /useRef\s*\(/g,
      /useContext\s*\(/g,
      /useReducer\s*\(/g,
      /useSharedValue\s*\(/g,
      /useAnimatedStyle\s*\(/g
    ];
    
    return hookPatterns.reduce((count, pattern) => {
      const matches = content.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  // Count animation usage
  countAnimations(content) {
    const animationPatterns = [
      /withTiming\s*\(/g,
      /withSpring\s*\(/g,
      /withDelay\s*\(/g,
      /useAnimatedStyle\s*\(/g,
      /LinearGradient/g,
      /Animated\./g
    ];
    
    return animationPatterns.reduce((count, pattern) => {
      const matches = content.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  // Check for complex rendering patterns
  checkComplexRendering(content) {
    const issues = [];
    
    // Check for potential performance issues
    if (content.includes('map(') && content.includes('FlatList')) {
      issues.push('Potential redundant mapping with FlatList');
    }
    
    if (content.match(/\.map\s*\(/g)?.length > 5) {
      issues.push('Multiple map operations detected');
    }
    
    if (content.includes('JSON.parse') || content.includes('JSON.stringify')) {
      issues.push('JSON operations in render path');
    }
    
    return issues;
  }

  // Check for memory leak risks
  checkMemoryRisks(content) {
    const risks = [];
    
    if (content.includes('setInterval') && !content.includes('clearInterval')) {
      risks.push('Potential setInterval without cleanup');
    }
    
    if (content.includes('setTimeout') && !content.includes('clearTimeout')) {
      risks.push('Potential setTimeout without cleanup');
    }
    
    if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
      risks.push('Event listeners without cleanup');
    }
    
    if (content.includes('useEffect') && !content.includes('return () =>')) {
      const effectCount = (content.match(/useEffect\s*\(/g) || []).length;
      const cleanupCount = (content.match(/return \(\) =>/g) || []).length;
      
      if (effectCount > cleanupCount) {
        risks.push('useEffect without cleanup functions');
      }
    }
    
    return risks;
  }

  // Analyze package.json dependencies
  analyzeDependencies() {
    console.log('📦 Analyzing dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      this.results.dependencyAnalysis = {
        totalDependencies: Object.keys(dependencies).length,
        heavyDependencies: this.identifyHeavyDependencies(dependencies),
        duplicateFunctionality: this.findDuplicateFunctionality(dependencies)
      };
      
      if (Object.keys(dependencies).length > THRESHOLDS.MAX_DEPENDENCIES) {
        this.results.recommendations.push({
          type: 'HIGH',
          component: 'package.json',
          issue: 'Too many dependencies',
          description: `${Object.keys(dependencies).length} dependencies detected`,
          solution: 'Audit and remove unused dependencies, consider lighter alternatives'
        });
      }
      
    } catch (error) {
      console.error('Error analyzing dependencies:', error.message);
    }
  }

  // Identify potentially heavy dependencies
  identifyHeavyDependencies(dependencies) {
    const heavyPackages = [
      'lodash', 'moment', 'react-native-vector-icons', 'react-native-svg',
      '@react-navigation/drawer', 'react-native-maps', 'lottie-react-native'
    ];
    
    return Object.keys(dependencies).filter(dep => 
      heavyPackages.some(heavy => dep.includes(heavy))
    );
  }

  // Find potential duplicate functionality
  findDuplicateFunctionality(dependencies) {
    const duplicates = [];
    const depKeys = Object.keys(dependencies);
    
    // Animation libraries
    const animationLibs = depKeys.filter(dep => 
      dep.includes('animation') || dep.includes('lottie') || dep.includes('reanimated')
    );
    if (animationLibs.length > 1) {
      duplicates.push({ category: 'Animation', packages: animationLibs });
    }
    
    // UI libraries
    const uiLibs = depKeys.filter(dep => 
      dep.includes('ui') || dep.includes('native-base') || dep.includes('elements')
    );
    if (uiLibs.length > 2) {
      duplicates.push({ category: 'UI Components', packages: uiLibs });
    }
    
    return duplicates;
  }

  // Analyze bundle size (requires build)
  analyzeBundleSize() {
    console.log('📊 Analyzing bundle size...');
    
    try {
      // This would require expo build to be completed
      // For now, we'll estimate based on dependencies and code complexity
      const nodeModulesSize = this.getNodeModulesSize();
      const codeComplexity = this.calculateCodeComplexity();
      
      this.results.bundleAnalysis = {
        nodeModulesSize,
        estimatedJSBundleSize: this.estimateBundleSize(codeComplexity),
        codeComplexity,
        recommendations: this.getBundleRecommendations(nodeModulesSize)
      };
      
    } catch (error) {
      console.error('Bundle analysis error:', error.message);
    }
  }

  // Get node_modules directory size
  getNodeModulesSize() {
    try {
      const result = execSync('du -sh node_modules 2>/dev/null || echo "0M"', { 
        cwd: PROJECT_ROOT,
        encoding: 'utf8' 
      }).trim();
      
      const sizeMatch = result.match(/(\d+(?:\.\d+)?)(M|G|K)/);
      if (sizeMatch) {
        const [, size, unit] = sizeMatch;
        const sizeInMB = unit === 'G' ? parseFloat(size) * 1024 : 
                        unit === 'K' ? parseFloat(size) / 1024 : 
                        parseFloat(size);
        return `${sizeInMB.toFixed(1)}MB`;
      }
      return result;
    } catch (error) {
      return 'Unknown';
    }
  }

  // Calculate overall code complexity
  calculateCodeComplexity() {
    const totalComponents = this.results.componentAnalysis.length;
    const totalLines = this.results.componentAnalysis.reduce((sum, comp) => sum + comp.lines, 0);
    const totalAnimations = this.results.componentAnalysis.reduce((sum, comp) => sum + comp.animations, 0);
    
    return {
      totalComponents,
      totalLines,
      totalAnimations,
      averageLinesPerComponent: Math.round(totalLines / totalComponents),
      animationDensity: Math.round(totalAnimations / totalComponents * 100) / 100
    };
  }

  // Estimate JS bundle size
  estimateBundleSize(complexity) {
    // Rough estimation based on code complexity
    const baseSize = 2; // MB
    const componentOverhead = complexity.totalComponents * 0.02; // 20KB per component
    const lineOverhead = complexity.totalLines * 0.001; // 1KB per line
    const animationOverhead = complexity.totalAnimations * 0.005; // 5KB per animation
    
    const estimatedSize = baseSize + componentOverhead + lineOverhead + animationOverhead;
    return `~${estimatedSize.toFixed(1)}MB`;
  }

  // Get bundle optimization recommendations
  getBundleRecommendations(nodeModulesSize) {
    const recommendations = [];
    
    const sizeInMB = parseFloat(nodeModulesSize) || 0;
    
    if (sizeInMB > 300) {
      recommendations.push('Node modules size excessive - audit and remove unused packages');
    }
    
    if (sizeInMB > 500) {
      recommendations.push('CRITICAL: Node modules over 500MB - major cleanup needed');
    }
    
    return recommendations;
  }

  // Find files with given extensions
  findFiles(extensions, excludeDirs = []) {
    const files = [];
    
    const searchDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.some(excluded => fullPath.includes(excluded))) {
            searchDir(fullPath);
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    };
    
    searchDir(PROJECT_ROOT);
    return files;
  }

  // Generate performance score
  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for issues
    this.results.recommendations.forEach(rec => {
      switch (rec.type) {
        case 'HIGH': score -= 15; break;
        case 'MEDIUM': score -= 8; break;
        case 'LOW': score -= 3; break;
      }
    });
    
    // Code quality bonus/penalty
    const complexity = this.results.bundleAnalysis.codeComplexity;
    if (complexity && complexity.averageLinesPerComponent > 300) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Run full analysis
  async analyze() {
    console.log('🚀 Starting Lunar Performance Analysis...\n');
    
    this.analyzeComponents();
    this.analyzeDependencies();
    this.analyzeBundleSize();
    
    this.results.performanceScore = this.calculatePerformanceScore();
    this.results.summary = this.generateSummary();
    
    // Save results
    fs.writeFileSync(ANALYSIS_OUTPUT, JSON.stringify(this.results, null, 2));
    
    console.log('\n📋 Analysis Complete!');
    console.log(`Performance Score: ${this.results.performanceScore}/100`);
    console.log(`Report saved to: ${ANALYSIS_OUTPUT}`);
    
    this.printSummary();
  }

  // Generate executive summary
  generateSummary() {
    const highPriorityIssues = this.results.recommendations.filter(r => r.type === 'HIGH');
    const totalComponents = this.results.componentAnalysis.length;
    
    return {
      totalComponents,
      highPriorityIssues: highPriorityIssues.length,
      performanceGrade: this.getPerformanceGrade(this.results.performanceScore),
      topIssues: highPriorityIssues.slice(0, 3).map(i => i.issue)
    };
  }

  getPerformanceGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Print summary to console
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`🎯 Performance Score: ${this.results.performanceScore}/100 (Grade: ${this.results.summary.performanceGrade})`);
    console.log(`📱 Total Components: ${this.results.summary.totalComponents}`);
    console.log(`🚨 High Priority Issues: ${this.results.summary.highPriorityIssues}`);
    
    if (this.results.summary.topIssues.length > 0) {
      console.log('\n🔍 Top Issues:');
      this.results.summary.topIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    console.log(`\n📦 Bundle Info:`);
    console.log(`  Node Modules: ${this.results.bundleAnalysis.nodeModulesSize}`);
    console.log(`  Estimated JS Bundle: ${this.results.bundleAnalysis.estimatedJSBundleSize}`);
    
    console.log(`\n📈 Code Metrics:`);
    const complexity = this.results.bundleAnalysis.codeComplexity;
    if (complexity) {
      console.log(`  Total Lines: ${complexity.totalLines}`);
      console.log(`  Avg Lines/Component: ${complexity.averageLinesPerComponent}`);
      console.log(`  Animation Usage: ${complexity.totalAnimations} instances`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Full report: ${ANALYSIS_OUTPUT}`);
    console.log('='.repeat(60));
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = PerformanceAnalyzer;