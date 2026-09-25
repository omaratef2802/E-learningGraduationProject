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
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it's admin or instructor
    const isAdmin = filePath.includes('admin');
    const route = isAdmin ? '/admin-profile' : '/instructor-profile';
    const linkStr = ` routerLink="${route}" style="cursor: pointer;"`;

    // We want to add it to `<div class="top-user">` or `<button class="top-user"`
    // if it doesn't already have routerLink or (click)
    
    let modified = false;
    content = content.replace(/<(div|button)([^>]*class=["'][^"']*top-user[^"']*["'][^>]*)>/g, (match, tag, rest) => {
      if (rest.includes('routerLink=') || rest.includes('(click)=')) {
        return match; // Already handled
      }
      modified = true;
      return `<${tag}${rest}${linkStr}>`;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated:', filePath);
    }
  }
});
