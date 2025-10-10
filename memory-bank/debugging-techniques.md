# Debugging Techniques Reference

This document catalogs essential terminal-based debugging techniques used during Intelli Insights development, with practical examples and explanations of cryptic syntax.

## 🔍 **Core Debugging Tools**

### **curl** - API Testing & HTTP Debugging

**Purpose**: Test HTTP endpoints, send requests, and inspect responses.

**Basic Syntax**:
```bash
curl [options] [URL]
```

**Common Options**:
- `-X METHOD`: Specify HTTP method (GET, POST, PUT, DELETE)
- `-H "Header: Value"`: Add custom headers
- `-d "data"`: Send POST data
- `--data-binary @file`: Send file contents
- `-v`: Verbose output (shows request/response headers)
- `-s`: Silent mode (suppress progress meter)
- `-o file`: Save output to file

**Examples from Intelli Insights debugging**:

```bash
# Test consent API endpoint
curl -X POST http://localhost:3000/api/intelli-insights/consent \
  -H "Content-Type: application/json" \
  -d '{"analytics": true, "marketing": false, "security": true, "version": "1.0"}'

# Test with authentication header
curl -H "x-api-key: admin-key-123" \
  http://localhost:3000/api/intelli-insights/dashboard

# Save response to file for analysis
curl -s http://localhost:3000/api/intelli-insights/dashboard \
  -H "x-api-key: admin-key-123" \
  -o dashboard_response.json
```

**Cryptic Explanations**:
- `-H "Content-Type: application/json"`: Tells server to expect JSON data
- `-d '{"key": "value"}'`: Sends data in request body
- `-s -o file`: Silent mode + output to file (no terminal clutter)

### **grep** - Text Search & Pattern Matching

**Purpose**: Find text patterns in files, search logs, filter output.

**Basic Syntax**:
```bash
grep [options] pattern [files]
```

**Common Options**:
- `-r`: Recursive search in directories
- `-i`: Case-insensitive search
- `-n`: Show line numbers
- `-l`: Show only filenames (not matching lines)
- `-v`: Invert match (show non-matching lines)
- `-E`: Extended regex
- `-F`: Fixed strings (no regex)

**Examples from Intelli Insights debugging**:

```bash
# Find all CREATE TABLE statements in schema files
grep "CREATE TABLE" database/schemas/*.sql

# Search for error messages in logs (case-insensitive)
grep -i "error" /var/log/postgresql.log

# Find files containing specific function calls
grep -r "logAnalyticsEvent" src/

# Show only filenames containing PostgreSQL errors
grep -l "psql" *.log

# Find lines NOT containing "success"
grep -v "success" api_response.log
```

**Cryptic Explanations**:
- `-r`: Recursively searches subdirectories (like `find . -name "*.js" -exec grep pattern {} \;`)
- `-l`: "List" mode - shows filenames only, useful for finding which files contain patterns
- `-E`: Enables extended regex (allows `+`, `?`, `|` operators)

### **sed** - Stream Editor for Text Manipulation

**Purpose**: Edit text streams, replace patterns, modify files in-place.

**Basic Syntax**:
```bash
sed [options] 'command' [file]
```

**Common Commands**:
- `'s/old/new/g'`: Substitute (replace) text
- `'d'`: Delete lines
- `'p'`: Print lines
- `'i\text'`: Insert text before line
- `'a\text'`: Append text after line

**Common Options**:
- `-i`: Edit files in-place (save changes)
- `-n`: Suppress automatic printing
- `-e`: Execute multiple commands

**Examples from Intelli Insights debugging**:

```bash
# Add IF NOT EXISTS to all CREATE TABLE statements
sed -i '' 's/CREATE TABLE /CREATE TABLE IF NOT EXISTS /g' database/schemas/*.sql

# Replace PostgreSQL casting syntax
sed -i '' 's/::int/cast(... as integer)/g' database/schemas/*.sql

# Remove specific lines containing pattern
sed -i '' '/CREATE EXTENSION/d' database/schemas/init.sql

# Add text before specific lines
sed -i '' '/CREATE TABLE/i\
-- This table stores analytics events\
' database/schemas/analytics_events.sql
```

**Cryptic Explanations**:
- `-i ''`: In-place editing with empty backup suffix (macOS requires `''`)
- `'s/old/new/g'`: Substitute command with global flag (replace all occurrences)
- `'/pattern/i\text'`: Insert text before lines matching pattern

### **find** - File System Search

**Purpose**: Locate files and directories based on criteria.

**Basic Syntax**:
```bash
find [path] [expression]
```

**Common Expressions**:
- `-name pattern`: Match filename pattern
- `-type f`: Files only (not directories)
- `-type d`: Directories only
- `-exec command {} \;`: Execute command on found files
- `-mtime -n`: Modified within last n days
- `-size +n`: Files larger than n units

**Examples from Intelli Insights debugging**:

```bash
# Find all SQL files in schemas directory
find database/schemas -name "*.sql"

# Find files containing CREATE TABLE
find database/schemas -name "*.sql" -exec grep -l "CREATE TABLE" {} \;

# Find recently modified files
find . -name "*.ts" -mtime -1

# Execute sed on multiple files
find database/schemas -name "*.sql" -exec sed -i '' 's/old/new/g' {} \;
```

**Cryptic Explanations**:
- `-exec command {} \;`: Execute command on each found file ({} is placeholder)
- `-mtime -1`: Files modified within 1 day (use +1 for older than 1 day)
- The `;` is escaped as `\;` to prevent shell interpretation

### **ps** - Process Status

**Purpose**: Show information about running processes.

**Basic Syntax**:
```bash
ps [options]
```

**Common Options**:
- `aux`: Show all processes with detailed info
- `-p PID`: Show specific process
- `-C command`: Show processes by command name
- `-u user`: Show processes by user

**Examples from Intelli Insights debugging**:

```bash
# Show all processes (find Node.js/PostgreSQL)
ps aux | grep node
ps aux | grep postgres

# Show process tree
ps auxf

# Find specific process by port
lsof -i :3000  # Alternative to ps for port-based lookup
```

**Cryptic Explanations**:
- `aux`: BSD-style options (a=all, u=user-oriented, x=include processes without terminal)
- `ps aux | grep pattern`: Filter process list (grep itself will also appear)

### **lsof** - List Open Files

**Purpose**: Show which files/processes are using specific resources.

**Basic Syntax**:
```bash
lsof [options] [files]
```

**Common Options**:
- `-i :port`: Show processes using specific port
- `-p PID`: Show files opened by process
- `-u user`: Show files opened by user

**Examples from Intelli Insights debugging**:

```bash
# Find what's using port 25001 (Turbopack)
lsof -i :25001

# Show all network connections
lsof -i

# Find processes with open files in specific directory
lsof +D /tmp
```

**Cryptic Explanations**:
- `-i :port`: Network interface format (colon indicates port)
- `+D dir`: Include directory and all subdirectories

## 🔧 **Advanced Debugging Patterns**

### **Pipeline Debugging**

Combine tools for complex analysis:

```bash
# Find and analyze API errors
curl -s http://localhost:3000/api/status 2>&1 | grep -i error | sed 's/.*error://i'

# Check database table existence
psql -c "\dt" | grep -E "(analytics_events|user_sessions)" | wc -l

# Monitor file changes during development
find src -name "*.ts" -newer package.json -exec echo "Modified: {}" \;
```

### **Error Analysis Workflow**

```bash
# 1. Check application logs
tail -f logs/app.log | grep -i error

# 2. Test API endpoints
curl -v http://localhost:3000/api/test 2>&1 | grep -E "(HTTP|error)"

# 3. Check database connectivity
psql -c "SELECT 1" 2>&1 | grep -q "ERROR" && echo "DB connection failed"

# 4. Analyze code for issues
grep -r "console.error" src/ | head -5
```

### **Performance Debugging**

```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/slow-endpoint

# Find large files
find . -type f -size +10M -exec ls -lh {} \;

# Check memory usage
ps aux --sort=-%mem | head -10
```

## 📝 **Cryptic Syntax Quick Reference**

| Syntax | Meaning | Example |
|--------|---------|---------|
| `2>&1` | Redirect stderr to stdout | `command 2>&1 \| grep error` |
| `\| wc -l` | Count lines | `grep pattern file \| wc -l` |
| `\;` | End of -exec command | `find . -exec grep pattern {} \;` |
| `-i ''` | In-place edit (macOS) | `sed -i '' 's/old/new/' file` |
| `+D` | Directory recursive | `lsof +D /path` |
| `-mtime -1` | Modified within 1 day | `find . -mtime -1` |

## 🎯 **Debugging Workflow**

1. **Identify Issue**: Use `curl` to test endpoints, `grep` to search logs
2. **Isolate Problem**: Use `ps`/`lsof` to check process status
3. **Analyze Code**: Use `find`/`grep` to locate relevant files
4. **Apply Fixes**: Use `sed` for bulk text changes
5. **Verify Solution**: Re-test with `curl` and monitor with `ps`

These techniques were essential for resolving Intelli Insights database setup issues, API debugging, and system integration problems during development.