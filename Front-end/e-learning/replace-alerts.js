const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app', (filePath) => {
  if (filePath.endsWith('.ts') && !filePath.includes('.spec.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 1. Replace alert(...) with Swal.fire(...)
    // regex for alert(...)
    const alertRegex = /\balert\s*\(\s*([^;]+)\s*\)/g;
    if (alertRegex.test(content)) {
      content = content.replace(alertRegex, (match, msg) => {
        modified = true;
        return `Swal.fire('Notice', ${msg}, 'info')`;
      });
    }

    // 2. Replace confirm
    // Pattern like: const confirmed = confirm(`Are you sure...`); if (!confirmed) return; ...
    // This is hard to regex because of multi-line block. It's better to manually replace confirm in those 4 files.
    
    // Add import if modified
    if (modified && !content.includes("import Swal")) {
      content = `import Swal from 'sweetalert2';\n` + content;
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated alert in:', filePath);
    }
  }
});
