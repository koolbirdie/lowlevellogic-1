# 🎓 IGCSE/A-LEVELS Pseudocode Editor

<div align="center">

**A powerful web-based pseudocode editor for Cambridge IGCSE Computer Science (0478/0984) and A-Level (9618)**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://pseudocode-runner.netlify.app)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://pseudocode-runner.netlify.app)

**[🚀 Try it Live](https://pseudocode-runner.netlify.app)** | [📚 Examples](#examples) | [💻 Local Setup](#local-development)

---

*Built with* [**Compyle**](https://compyle.com) *- AI-powered development platform*

</div>

## ✨ Features

### 🎯 Core Functionality
- ✅ **Full IGCSE/A-LEVELS Syntax Support** - 100% compliant with Cambridge syllabus
- ✅ **Real-time Validation** - Syntax errors detected as you type (500ms debounced)
- ✅ **Animated Execution** - Watch output appear line-by-line (300ms between lines)
- ✅ **Line Numbers** - Easy navigation and error reference
- ✅ **Syntax Highlighting** - Keywords, operators, and data types color-coded
- ✅ **Error Detection** - Detailed syntax and runtime error messages with line numbers
- ✅ **Auto-save** - Code persists in browser LocalStorage
- ✅ **File Operations** - Download/upload code as .txt files
- ✅ **31 Built-in Examples** - Learn from comprehensive sample programs including 6 memory management examples
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **User Authentication** - Secure login with Google or Email/Password
- ✅ **Guest Mode** - Try all features without signing up!

### 🧠 Advanced Memory Management (NEW!)
- ✅ **64KB Simulated RAM** - Low-level memory environment for algorithm research
- ✅ **Pointer Operations** - Address-of (`&`) and dereference (`*`) operators
- ✅ **Dynamic Memory** - `MALLOC()` and `FREE()` for heap allocation
- ✅ **Memory Visualization** - Real-time memory state with hex dump view
- ✅ **Operation Tracing** - Complete memory operation logging
- ✅ **Type-Safe Pointers** - `POINTER_TO_INTEGER`, `POINTER_TO_REAL`, `POINTER_TO_CHAR`, `VOID_POINTER`
- ✅ **Educational Debugging** - Perfect for learning low-level programming concepts

### 🎨 User Experience
- 🖱️ **Split-view Editor** - Code on left, output on right
- ⚡ **Instant Feedback** - See errors before you run
- 🎬 **Step-by-step Output** - Animated execution helps understand flow
- 💾 **Persistent Code** - Never lose your work
- 📱 **Mobile Friendly** - Code on the go

## 🎓 Supported Syntax

### 📊 Data Types
```
INTEGER     - Whole numbers
REAL        - Decimal numbers
STRING      - Text values
CHAR        - Single character
BOOLEAN     - TRUE or FALSE
ARRAY       - Single and multi-dimensional arrays
```

### 🧠 Memory Management Types (NEW!)
```
POINTER_TO_INTEGER    - Pointer to integer values
POINTER_TO_REAL       - Pointer to real numbers
POINTER_TO_CHAR       - Pointer to character values
VOID_POINTER          - Generic pointer type
```

### 🔀 Control Structures

#### Conditionals
```pseudocode
IF condition THEN
    statements
ELSE IF condition THEN
    statements
ELSE
    statements
ENDIF
```

```pseudocode
CASE OF variable
    value1 : statement
    value2 : statement
    OTHERWISE : statement
ENDCASE
```

#### Loops
```pseudocode
FOR counter <-- start TO end STEP increment
    statements
NEXT counter

WHILE condition DO
    statements
ENDWHILE

REPEAT
    statements
UNTIL condition
```

### 🔧 Functions & Procedures

#### Functions
```pseudocode
FUNCTION Name(param : TYPE) RETURNS TYPE
    DECLARE local : TYPE
    // function body
    RETURN value
ENDFUNCTION
```

#### Procedures
```pseudocode
PROCEDURE Name(BYVAL param1 : TYPE, BYREF param2 : TYPE)
    DECLARE local : TYPE
    // procedure body
ENDPROCEDURE

CALL Name(arg1, arg2)
```

### 📥 Input/Output
```pseudocode
INPUT variable
OUTPUT expression, "text", variable
```

### 🧠 Memory Management Operations (NEW!)

#### Pointer Operations
```pseudocode
// Address-of and dereference
DECLARE x : INTEGER
DECLARE ptr : POINTER_TO_INTEGER
ptr <-- &x        // Get memory address of x
*ptr <-- 100      // Write value through pointer
OUTPUT *ptr       // Read value through pointer
```

#### Dynamic Memory Allocation
```pseudocode
DECLARE dynamic : POINTER_TO_INTEGER
dynamic <-- MALLOC(10)    // Allocate 10 bytes
*dynamic <-- 42          // Write to allocated memory
FREE(dynamic)            // Deallocate memory
```

#### Memory Size Information
```pseudocode
DECLARE size : INTEGER
size <-- SIZE_OF(INTEGER)      // Get size of data type
size <-- SIZE_OF(REAL)         // Get size of real
size <-- SIZE_OF(POINTER_TO_INTEGER)  // Get pointer size
```

#### Hexadecimal Literals
```pseudocode
DECLARE address : INTEGER
address <-- 0x1000     // Hexadecimal literal
OUTPUT address         // Displays: 4096
```

### 🧮 Operators

**Arithmetic:** `+` `-` `*` `/` `DIV` `MOD`
**Comparison:** `=` `<>` `<` `>` `<=` `>=`
**Logical:** `AND` `OR` `NOT`
**String:** `&` (concatenation)
**Memory:** `&` (address-of), `*` (dereference)
**Assignment:** `<--` or `←`

### 📚 Built-in Functions

**String Functions:**
- `LENGTH(string)` - Returns string length
- `SUBSTRING(string, start, length)` - Extracts substring (1-indexed)
- `UCASE(string)` - Converts to uppercase
- `LCASE(string)` - Converts to lowercase

**Type Conversion:**
- `INT(x)` - Converts to integer (truncates)
- `REAL(x)` - Converts to real number
- `STRING(x)` - Converts to string

**Memory Functions:**
- `MALLOC(size)` - Allocates memory and returns pointer
- `FREE(pointer)` - Deallocates dynamically allocated memory
- `SIZE_OF(dataType)` - Returns size in bytes of data type

**Math Functions:**
- `ROUND(x, decimals)` - Rounds to decimal places
- `RANDOM()` - Returns random 0.0 to 1.0

### 💬 Comments
```pseudocode
// Single-line comments
```

## 📚 Examples

The editor includes **31 comprehensive examples** covering:

1. **Basic Input/Output** - Simple I/O operations
2. **IF Statement** - Grade calculator with multiple conditions
3. **FOR Loop** - Counter demonstration
4. **WHILE Loop** - Sum calculation
5. **Arrays** - 1D array manipulation
6. **Functions** - Factorial and IsPrime calculations
7. **Procedures** - Bubble Sort algorithm
8. **String Manipulation** - String function showcase with vowel counting
9. **2D Arrays** - Matrix operations with row and diagonal sums
10. **Linear Search** - Search with string arrays
11. **Binary Search** - Efficient search algorithm
12. **Selection Sort** - Complete sorting algorithm
13. **CASE Statement with Ranges** - Grade assignment using ranges
14. **REPEAT UNTIL Loop** - Counter demonstration
15. **BYREF Parameters** - Swap procedure demonstration
16. **Nested Loops** - Multiplication table and pattern generation
17. **Parallel Arrays** - Simulating records with multiple arrays
18. **Type Conversion** - INT, REAL, STRING functions
19. **String Concatenation** - Combining strings with & operator
20. **Nested IF Statements** - Complex conditional logic
21. **Mathematical Operations** - All arithmetic operators including DIV and MOD
22. **Advanced Examples** - Combining multiple concepts
23. **Memory Management - Pointers Basics** - Introduction to pointers and addresses
24. **Dynamic Memory Allocation** - MALLOC and FREE operations
25. **Memory Sizes & Types** - SIZE_OF function and type information
26. **Linked List Implementation** - Data structures with pointers
27. **Binary Tree Traversal** - Tree structures and recursive algorithms
28. **Advanced Memory Operations** - Complex pointer manipulations

## 🚀 Quick Start

### Online (Recommended)

Simply visit **[https://pseudocode-runner.netlify.app](https://pseudocode-runner.netlify.app)** and start coding immediately!

### Local Development

```bash
# Clone the repository
git clone https://github.com/idreesmuhammadqazi-create/test.git
cd test

# Install dependencies
npm install

# Set up Firebase Authentication (required)
# See Firebase Setup section below

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🔐 Authentication & Access Requirements

### Quick Start (No Registration Required!)

**🎉 GREAT NEWS!** All features including the new memory management system work immediately without registration:

- ✅ **Full pseudocode execution** - Run any IGCSE/A-LEVELS program
- ✅ **Memory debugging** - Complete pointer and memory visualization
- ✅ **Real-time validation** - Syntax checking and error detection
- ✅ **All examples** - Access 22 built-in example programs
- ✅ **File operations** - Download/upload your code
- ✅ **Auto-save** - Code persists in browser

**Just visit the website and start coding!**

### Optional Registration Benefits

Create an account for additional cloud features:
- ☁️ **Save programs online** - Access your code from any device
- 📚 **Program library** - Manage and organize your saved programs
- 🔗 **Share code** - Generate shareable links to your programs
- 📧 **Email verification** - Full cloud synchronization

### Firebase Authentication Setup (For Local Development)

This application uses Firebase for user authentication. Follow these steps to set up:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Once created, you'll be in your project dashboard

2. **Enable Authentication Methods**
   - Click "Authentication" in the left sidebar
   - Go to the "Sign-in method" tab
   - Enable **Email/Password** authentication
   - Enable **Google** authentication
   - For Google sign-in, you may need to set a support email

3. **Register Your Web App**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Give it a nickname (e.g., "Pseudocode Editor")
   - Copy the Firebase configuration object

4. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and paste your Firebase config values
   # Get these from Firebase Console > Project Settings > Your apps
   ```
   
   Your `.env` file should look like:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

5. **Restart Development Server**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

**Security Note:** Never commit your `.env` file to version control. The `.gitignore` file is already configured to exclude it.

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📖 Usage Guide

### Writing Code

1. **Type your pseudocode** in the left editor panel
2. **Syntax highlighting** helps identify keywords and structure
3. **Line numbers** help reference code locations
4. **Auto-save** keeps your work safe (saves every second)

### Running Code

1. **Click "Run"** button to execute
2. **Watch output** appear line-by-line with animation
3. **INPUT prompts** appear as browser dialogs
4. **Errors** show in the error panel with line numbers

### Memory Debugging (NEW!)

1. **Press "M" key** or click the memory button to toggle memory view
2. **Variables Tab** - See all variables with addresses and values
3. **Memory Dump Tab** - View raw memory in hexadecimal format
4. **Trace Log Tab** - See complete memory operation history
5. **Real-time updates** - Memory view updates during execution

### Managing Code

- **Clear** - Remove all code (with confirmation)
- **Download** - Save code as timestamped .txt file
- **Upload** - Load code from .txt file
- **Examples** - Load any of 22 sample programs

### Learning Features

- **Real-time validation** - See errors before running
- **Detailed error messages** - Understand what went wrong
- **Line number references** - Jump directly to problems
- **Example programs** - Learn by studying working code
- **Memory visualization** - Understand how memory works

## 🎯 IGCSE/A-LEVELS Compliance

This editor strictly follows Cambridge IGCSE/A-LEVELS pseudocode standards:

✅ **Syntax Rules**
- Keywords in UPPERCASE
- Case-sensitive identifiers
- No semicolons required
- One statement per line

✅ **Array Behavior**
- Static array bounds (literal numbers only)
- Custom index ranges (e.g., ARRAY[1:10] or ARRAY[0:9])
- Multi-dimensional support
- Bounds checking at runtime

✅ **Variable Scoping**
- Global and local scope support
- FOR loop variables auto-declared
- Parameter passing (BYVAL/BYREF)

✅ **Error Handling**
- Division by zero detection
- Uninitialized variable checks
- Type mismatch detection
- Array bounds validation
- Infinite loop protection (10,000 iteration limit)
- Recursion depth limit (1,000 calls)

## 🛠️ Technologies

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CodeMirror 6** - Professional code editor
- **Firebase Authentication** - Secure user management (Google OAuth & Email/Password)
- **CSS Modules** - Scoped styling
- **Netlify** - Production hosting

## 🎨 Architecture

```
src/
├── components/          # React UI components
│   ├── Editor/         # CodeMirror editor with syntax highlighting
│   ├── OutputPanel/    # Animated output display
│   ├── ErrorDisplay/   # Error message panel
│   ├── Toolbar/        # Control buttons
│   ├── MemoryView/     # Memory visualization and debugging (NEW!)
│   └── Auth/           # User authentication components
├── interpreter/        # Core execution engine
│   ├── lexer.ts       # Tokenization (extended with memory keywords)
│   ├── parser.ts      # AST generation (extended with pointer operations)
│   ├── interpreter.ts # Code execution (integrated memory engine)
│   ├── memory.ts      # Memory management system (NEW!)
│   ├── tracer.ts      # Memory operation tracing (NEW!)
│   └── types.ts       # Type definitions (extended with pointer types)
├── contexts/           # React contexts (Auth, Theme)
├── services/           # Firebase and cloud services
├── validator/          # Real-time syntax validation
├── utils/             # Helper functions
└── constants/         # Example programs
```

## 📝 Example Code

### Traditional IGCSE Example
```pseudocode
// Bubble Sort Algorithm
DECLARE nums : ARRAY[1:5] OF INTEGER
DECLARE temp, index : INTEGER
DECLARE isSorted : BOOLEAN
DECLARE endIndex : INTEGER

// Initialize array
nums[1] <-- 64
nums[2] <-- 34
nums[3] <-- 25
nums[4] <-- 12
nums[5] <-- 22

// Bubble sort
endIndex <-- 4
isSorted <-- FALSE

WHILE isSorted = FALSE DO
    isSorted <-- TRUE
    FOR index <-- 1 TO endIndex
        IF nums[index] > nums[index + 1] THEN
            temp <-- nums[index]
            nums[index] <-- nums[index + 1]
            nums[index + 1] <-- temp
            isSorted <-- FALSE
        ENDIF
    NEXT index
    endIndex <-- endIndex - 1
ENDWHILE

// Display sorted array
OUTPUT "Sorted array:"
FOR index <-- 1 TO 5
    OUTPUT nums[index]
NEXT index
```

### Memory Management Example (NEW!)
```pseudocode
// Linked List Implementation using Pointers
DECLARE nodeData : ARRAY[1:3] OF INTEGER
DECLARE nextNode : ARRAY[1:3] OF INTEGER
DECLARE head, current, newNode : POINTER_TO_INTEGER
DECLARE i : INTEGER

// Initialize linked list data
nodeData[1] <-- 10
nextNode[1] <-- 2    // Points to node 2
nodeData[2] <-- 20
nextNode[2] <-- 3    // Points to node 3
nodeData[3] <-- 30
nextNode[3] <-- 0    // NULL pointer

// Create head pointer
head <-- &nodeData[1]

// Traverse linked list using pointers
current <-- head
OUTPUT "Linked List Contents:"
WHILE current <> 0 DO
    OUTPUT "Node value: ", *current
    // Calculate next node address (simple example)
    DECLARE nodeIndex : INTEGER
    nodeIndex <-- (current - &nodeData[1]) / 4 + 1
    IF nodeIndex <= 3 THEN
        current <-- &nodeData[nextNode[nodeIndex]]
    ELSE
        current <-- 0  // End of list
    ENDIF
ENDWHILE

// Dynamic memory allocation example
DECLARE dynamicPtr : POINTER_TO_INTEGER
DECLARE allocSize : INTEGER

allocSize <-- SIZE_OF(INTEGER) * 5
dynamicPtr <-- MALLOC(allocSize)

// Use dynamically allocated memory
*dynamicPtr <-- 100
*(dynamicPtr + 4) <-- 200  // Second integer

OUTPUT "Dynamic memory values:"
OUTPUT "First: ", *dynamicPtr
OUTPUT "Second: ", *(dynamicPtr + 4)

// Clean up
FREE(dynamicPtr)
OUTPUT "Memory deallocated"
```

## 🐛 Error Detection

The editor detects and reports:

### Syntax Errors
- Missing ENDIF, ENDWHILE, etc.
- Undeclared variables
- Invalid identifier names
- Mismatched FOR/NEXT variables
- Invalid array declarations

### Runtime Errors
- Division by zero
- Array index out of bounds
- Type mismatches
- Uninitialized variables
- Invalid function parameters

### Memory Errors (NEW!)
- Invalid pointer dereference
- Memory allocation failure
- Access to freed memory
- Null pointer access
- Memory bounds violations
- Invalid pointer types

## 🌟 Use Cases

- 📚 **Learning** - Practice IGCSE/A-LEVELS pseudocode
- 📝 **Exam Prep** - Test algorithms before exams
- 👨‍🏫 **Teaching** - Demonstrate concepts in class
- 🔬 **Algorithm Testing** - Verify logic before implementation
- 💡 **Quick Prototyping** - Test ideas rapidly
- 🧠 **Memory Education** - Learn low-level programming concepts
- 🔍 **Algorithm Research** - Analyze memory usage patterns
- 🎓 **C/C++ Preparation** - Practice pointer concepts before learning C
- 📊 **Data Structures** - Implement linked lists, trees, and graphs

## 🎯 Roadmap

Future enhancements:
- [ ] Dark mode
- [ ] Syntax highlighting customization
- [ ] Share code via URL
- [ ] Step-by-step debugger
- [ ] More example programs
- [ ] Export to PDF
- [ ] Collaborative editing

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use in your projects!

## 🙏 Acknowledgments

- **Cambridge International** - For the IGCSE/A-LEVELS pseudocode specification
- **CodeMirror** - For the excellent code editor
- **Netlify** - For reliable hosting
- **Compyle** - For AI-powered development tools

---

<div align="center">

**Made with ❤️ using [Compyle](https://compyle.com)**

*Compyle - Build software faster with AI-powered development*

[![Visit Compyle](https://img.shields.io/badge/Powered%20by-Compyle-blue?style=for-the-badge)](https://compyle.com)

[🌐 Live Demo](https://pseudocode-runner.netlify.app) • [⭐ Star on GitHub](https://github.com/idreesmuhammadqazi-create/test) • [🐛 Report Bug](https://github.com/idreesmuhammadqazi-create/test/issues)

</div>
