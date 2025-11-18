/**
 * Example pseudocode snippets for IGCSE/A-LEVELS syntax
 */

export interface Example {
  title: string;
  code: string;
}

export const EXAMPLES: Example[] = [
  {
    title: 'Basic Input/Output',
    code: `// Simple input and output
DECLARE name : STRING
DECLARE age : INTEGER

OUTPUT "Enter your name: "
INPUT name
OUTPUT "Enter your age: "
INPUT age

OUTPUT "Hello ", name
OUTPUT "You are ", age, " years old"`
  },
  {
    title: 'IF Statement',
    code: `// Grade calculator
DECLARE score : INTEGER

OUTPUT "Enter your score: "
INPUT score

IF score >= 90 THEN
    OUTPUT "Grade: A*"
ELSE IF score >= 80 THEN
    OUTPUT "Grade: A"
ELSE IF score >= 70 THEN
    OUTPUT "Grade: B"
ELSE IF score >= 60 THEN
    OUTPUT "Grade: C"
ELSE
    OUTPUT "Grade: D"
ENDIF`
  },
  {
    title: 'FOR Loop',
    code: `// Count from 1 to 10
DECLARE counter : INTEGER

FOR counter <-- 1 TO 10
    OUTPUT counter
NEXT counter

OUTPUT "Done!"`
  },
  {
    title: 'WHILE Loop',
    code: `// Sum of numbers
DECLARE total : INTEGER
DECLARE number : INTEGER

total <-- 0
number <-- 1

WHILE number <= 10 DO
    total <-- total + number
    number <-- number + 1
ENDWHILE

OUTPUT "Sum: ", total`
  },
  {
    title: 'Arrays',
    code: `// Array manipulation
DECLARE numbers : ARRAY[1:5] OF INTEGER
DECLARE i : INTEGER
DECLARE sum : INTEGER

// Fill array
FOR i <-- 1 TO 5
    OUTPUT "Enter number ", i, ": "
    INPUT numbers[i]
NEXT i

// Calculate sum
sum <-- 0
FOR i <-- 1 TO 5
    sum <-- sum + numbers[i]
NEXT i

OUTPUT "Sum: ", sum
OUTPUT "Average: ", sum / 5`
  },
  {
    title: 'Functions - Factorial & IsPrime',
    code: `// Multiple functions with return values
DECLARE Num, Result : INTEGER

FUNCTION Factorial(N : INTEGER) RETURNS INTEGER
    DECLARE Fact, Counter : INTEGER
    Fact <-- 1
    FOR Counter <-- 1 TO N
        Fact <-- Fact * Counter
    NEXT Counter
    RETURN Fact
ENDFUNCTION

FUNCTION IsPrime(Number : INTEGER) RETURNS BOOLEAN
    DECLARE Divisor : INTEGER
    IF Number < 2 THEN
        RETURN FALSE
    ENDIF
    FOR Divisor <-- 2 TO Number - 1
        IF Number MOD Divisor = 0 THEN
            RETURN FALSE
        ENDIF
    NEXT Divisor
    RETURN TRUE
ENDFUNCTION

Num <-- 5
Result <-- Factorial(Num)
OUTPUT "Factorial of ", Num, " is ", Result

FOR Num <-- 1 TO 20
    IF IsPrime(Num) THEN
        OUTPUT Num, " is prime"
    ENDIF
NEXT Num`
  },
  {
    title: 'Procedures - Bubble Sort',
    code: `// Bubble Sort with procedure
DECLARE Arr : ARRAY[1:8] OF INTEGER
DECLARE i : INTEGER

PROCEDURE BubbleSort(BYREF Data : ARRAY OF INTEGER, Size : INTEGER)
    DECLARE Pass, Index, Swap : INTEGER
    FOR Pass <-- 1 TO Size - 1
        FOR Index <-- 1 TO Size - Pass
            IF Data[Index] > Data[Index + 1] THEN
                Swap <-- Data[Index]
                Data[Index] <-- Data[Index + 1]
                Data[Index + 1] <-- Swap
            ENDIF
        NEXT Index
    NEXT Pass
ENDPROCEDURE

Arr[1] <-- 64
Arr[2] <-- 34
Arr[3] <-- 25
Arr[4] <-- 12
Arr[5] <-- 22
Arr[6] <-- 11
Arr[7] <-- 90
Arr[8] <-- 88

OUTPUT "Before sorting:"
FOR i <-- 1 TO 8
    OUTPUT Arr[i]
NEXT i

CALL BubbleSort(Arr, 8)

OUTPUT "After sorting:"
FOR i <-- 1 TO 8
    OUTPUT Arr[i]
NEXT i`
  },
  {
    title: 'String Manipulation',
    code: `// Advanced string operations
DECLARE Text, Word, Result : STRING
DECLARE Position, Len, Vowels, i : INTEGER
DECLARE CurrentChar : CHAR

Text <-- "IGCSE Computer Science"
OUTPUT "Original text: ", Text

Len <-- LENGTH(Text)
OUTPUT "Length: ", Len

Word <-- SUBSTRING(Text, 1, 5)
OUTPUT "First 5 characters: ", Word

Position <-- 7
Word <-- SUBSTRING(Text, Position, 8)
OUTPUT "Word at position 7: ", Word

Result <-- UCASE(Text)
OUTPUT "Uppercase: ", Result

Result <-- LCASE(Text)
OUTPUT "Lowercase: ", Result

// Count vowels
Vowels <-- 0
FOR i <-- 1 TO LENGTH(Text)
    CurrentChar <-- SUBSTRING(Text, i, 1)
    IF CurrentChar = "A" OR CurrentChar = "E" OR CurrentChar = "I" OR CurrentChar = "O" OR CurrentChar = "U" THEN
        Vowels <-- Vowels + 1
    ENDIF
    IF CurrentChar = "a" OR CurrentChar = "e" OR CurrentChar = "i" OR CurrentChar = "o" OR CurrentChar = "u" THEN
        Vowels <-- Vowels + 1
    ENDIF
NEXT i
OUTPUT "Number of vowels: ", Vowels`
  },
  {
    title: '2D Arrays',
    code: `// 2D Array with row and diagonal sums
DECLARE Matrix : ARRAY[1:3, 1:3] OF INTEGER
DECLARE Row, Col, Sum, Diagonal : INTEGER

// Initialize 2D array
Matrix[1,1] <-- 1
Matrix[1,2] <-- 2
Matrix[1,3] <-- 3
Matrix[2,1] <-- 4
Matrix[2,2] <-- 5
Matrix[2,3] <-- 6
Matrix[3,1] <-- 7
Matrix[3,2] <-- 8
Matrix[3,3] <-- 9

OUTPUT "Matrix contents:"
FOR Row <-- 1 TO 3
    FOR Col <-- 1 TO 3
        OUTPUT Matrix[Row, Col], " "
    NEXT Col
    OUTPUT ""
NEXT Row

// Calculate row sums
FOR Row <-- 1 TO 3
    Sum <-- 0
    FOR Col <-- 1 TO 3
        Sum <-- Sum + Matrix[Row, Col]
    NEXT Col
    OUTPUT "Sum of row ", Row, " is ", Sum
NEXT Row

// Calculate diagonal sum
Diagonal <-- 0
FOR Row <-- 1 TO 3
    Diagonal <-- Diagonal + Matrix[Row, Row]
NEXT Row
OUTPUT "Diagonal sum: ", Diagonal`
  },
  {
    title: 'Linear Search',
    code: `// Linear search with string array
DECLARE Names : ARRAY[1:5] OF STRING
DECLARE SearchName : STRING
DECLARE Index : INTEGER
DECLARE FoundAt : INTEGER

Names[1] <-- "Ahmed"
Names[2] <-- "Fatima"
Names[3] <-- "Hassan"
Names[4] <-- "Zainab"
Names[5] <-- "Omar"

SearchName <-- "Hassan"
FoundAt <-- -1

FOR Index <-- 1 TO 5
    IF Names[Index] = SearchName THEN
        FoundAt <-- Index
    ENDIF
NEXT Index

IF FoundAt <> -1 THEN
    OUTPUT SearchName, " found at position ", FoundAt
ELSE
    OUTPUT SearchName, " not found"
ENDIF`
  },
  {
    title: 'Binary Search',
    code: `// Binary Search algorithm
DECLARE Numbers : ARRAY[1:10] OF INTEGER
DECLARE SearchValue, Low, High, Mid : INTEGER
DECLARE Found : BOOLEAN

// Initialize sorted array
Numbers[1] <-- 5
Numbers[2] <-- 12
Numbers[3] <-- 18
Numbers[4] <-- 23
Numbers[5] <-- 31
Numbers[6] <-- 45
Numbers[7] <-- 56
Numbers[8] <-- 67
Numbers[9] <-- 78
Numbers[10] <-- 89

SearchValue <-- 45
Low <-- 1
High <-- 10
Found <-- FALSE

WHILE Low <= High AND Found = FALSE DO
    Mid <-- (Low + High) DIV 2
    IF Numbers[Mid] = SearchValue THEN
        Found <-- TRUE
        OUTPUT "Found at position: ", Mid
    ELSE
        IF Numbers[Mid] < SearchValue THEN
            Low <-- Mid + 1
        ELSE
            High <-- Mid - 1
        ENDIF
    ENDIF
ENDWHILE

IF Found = FALSE THEN
    OUTPUT "Value not found"
ENDIF`
  },
  {
    title: 'Selection Sort',
    code: `// Selection Sort algorithm
DECLARE Numbers : ARRAY[1:6] OF INTEGER
DECLARE i, j, MinIndex, Temp : INTEGER

Numbers[1] <-- 64
Numbers[2] <-- 25
Numbers[3] <-- 12
Numbers[4] <-- 22
Numbers[5] <-- 11
Numbers[6] <-- 90

OUTPUT "Before sorting:"
FOR i <-- 1 TO 6
    OUTPUT Numbers[i]
NEXT i

// Selection Sort
FOR i <-- 1 TO 5
    MinIndex <-- i
    FOR j <-- i + 1 TO 6
        IF Numbers[j] < Numbers[MinIndex] THEN
            MinIndex <-- j
        ENDIF
    NEXT j
    IF MinIndex <> i THEN
        Temp <-- Numbers[i]
        Numbers[i] <-- Numbers[MinIndex]
        Numbers[MinIndex] <-- Temp
    ENDIF
NEXT i

OUTPUT "After sorting:"
FOR i <-- 1 TO 6
    OUTPUT Numbers[i]
NEXT i`
  },
  {
    title: 'CASE Statement with Ranges',
    code: `// CASE statement with range support
DECLARE Grade : CHAR
DECLARE Mark : INTEGER

Mark <-- 75

CASE OF Mark
    50 TO 59 : Grade <-- 'D'
    60 TO 69 : Grade <-- 'C'
    70 TO 79 : Grade <-- 'B'
    80 TO 100 : Grade <-- 'A'
    OTHERWISE : Grade <-- 'F'
ENDCASE

OUTPUT "Mark: ", Mark, " Grade: ", Grade`
  },
  {
    title: 'REPEAT UNTIL Loop',
    code: `// REPEAT UNTIL with counter
DECLARE Counter : INTEGER
DECLARE Total : INTEGER

Counter <-- 1
Total <-- 0

REPEAT
    Total <-- Total + Counter
    OUTPUT "Counter: ", Counter, " Total: ", Total
    Counter <-- Counter + 1
UNTIL Counter > 5

OUTPUT "Final total: ", Total`
  },
  {
    title: 'BYREF Parameters',
    code: `// Pass by reference example
PROCEDURE Swap(BYREF a : INTEGER, BYREF b : INTEGER)
    DECLARE temp : INTEGER
    temp <-- a
    a <-- b
    b <-- temp
ENDPROCEDURE

// Main program
DECLARE x, y : INTEGER

x <-- 10
y <-- 20

OUTPUT "Before swap:"
OUTPUT "x = ", x
OUTPUT "y = ", y

CALL Swap(x, y)

OUTPUT "After swap:"
OUTPUT "x = ", x
OUTPUT "y = ", y`
  },
  {
    title: 'Nested Loops - Patterns',
    code: `// Pattern generation
DECLARE OuterLoop, InnerLoop, Number : INTEGER

OUTPUT "Multiplication table:"
FOR OuterLoop <-- 1 TO 5
    FOR InnerLoop <-- 1 TO 5
        Number <-- OuterLoop * InnerLoop
        OUTPUT Number, " "
    NEXT InnerLoop
    OUTPUT ""
NEXT OuterLoop

OUTPUT "Triangle pattern:"
FOR OuterLoop <-- 1 TO 5
    FOR InnerLoop <-- 1 TO OuterLoop
        OUTPUT "*"
    NEXT InnerLoop
    OUTPUT ""
NEXT OuterLoop`
  },
  {
    title: 'Parallel Arrays',
    code: `// Parallel arrays (simulating records)
DECLARE StudentIDs : ARRAY[1:3] OF INTEGER
DECLARE StudentNames : ARRAY[1:3] OF STRING
DECLARE StudentScores : ARRAY[1:3] OF INTEGER
DECLARE Highest, HighestIndex, Idx : INTEGER

StudentIDs[1] <-- 101
StudentNames[1] <-- "Ali"
StudentScores[1] <-- 88

StudentIDs[2] <-- 102
StudentNames[2] <-- "Sara"
StudentScores[2] <-- 95

StudentIDs[3] <-- 103
StudentNames[3] <-- "Bilal"
StudentScores[3] <-- 82

OUTPUT "Student Records:"
FOR Idx <-- 1 TO 3
    OUTPUT "ID: ", StudentIDs[Idx], " Name: ", StudentNames[Idx], " Score: ", StudentScores[Idx]
NEXT Idx

Highest <-- StudentScores[1]
HighestIndex <-- 1
FOR Idx <-- 2 TO 3
    IF StudentScores[Idx] > Highest THEN
        Highest <-- StudentScores[Idx]
        HighestIndex <-- Idx
    ENDIF
NEXT Idx

OUTPUT "Top student: ", StudentNames[HighestIndex], " with score ", Highest`
  },
  {
    title: 'Type Conversion',
    code: `// Type conversion functions
DECLARE IntNum : INTEGER
DECLARE RealNum : REAL
DECLARE StrNum : STRING

RealNum <-- 3.7
IntNum <-- INT(RealNum)
OUTPUT "INT(3.7) = ", IntNum

IntNum <-- 42
RealNum <-- REAL(IntNum)
OUTPUT "REAL(42) = ", RealNum

IntNum <-- 123
StrNum <-- STRING(IntNum)
OUTPUT "STRING(123) = ", StrNum

RealNum <-- 3.14159
OUTPUT "Original: ", RealNum
OUTPUT "ROUND(3.14159, 2) = ", ROUND(RealNum, 2)`
  },
  {
    title: 'String Concatenation',
    code: `// String concatenation
DECLARE FirstName, LastName, FullName : STRING
DECLARE Age : INTEGER
DECLARE Message : STRING

FirstName <-- "John"
LastName <-- "Smith"
Age <-- 16

FullName <-- FirstName & " " & LastName
OUTPUT "Full name: ", FullName

Message <-- "Hello, " & FullName & "! You are " & STRING(Age) & " years old."
OUTPUT Message`
  },
  {
    title: 'Nested IF Statements',
    code: `// Nested IF with complex logic
DECLARE Age : INTEGER
DECLARE HasLicense : BOOLEAN
DECLARE CanDrive : BOOLEAN

Age <-- 18
HasLicense <-- TRUE

IF Age >= 18 THEN
    IF HasLicense = TRUE THEN
        CanDrive <-- TRUE
        OUTPUT "You can drive"
    ELSE
        CanDrive <-- FALSE
        OUTPUT "You need a license"
    ENDIF
ELSE
    CanDrive <-- FALSE
    OUTPUT "You are too young to drive"
ENDIF`
  },
  {
    title: 'Mathematical Operations',
    code: `// All mathematical operators
DECLARE a, b, Result : INTEGER
DECLARE Division : REAL

a <-- 17
b <-- 5

Result <-- a + b
OUTPUT a, " + ", b, " = ", Result

Result <-- a - b
OUTPUT a, " - ", b, " = ", Result

Result <-- a * b
OUTPUT a, " * ", b, " = ", Result

Division <-- a / b
OUTPUT a, " / ", b, " = ", Division

Result <-- a DIV b
OUTPUT a, " DIV ", b, " = ", Result

Result <-- a MOD b
OUTPUT a, " MOD ", b, " = ", Result`
  },
  {
    title: 'File Operations - Reading',
    code: `// Read and display file contents
DECLARE FileName : STRING
DECLARE Line : STRING
DECLARE LineCount : INTEGER

FileName <-- "data.txt"
LineCount <-- 0

OPENFILE FileName FOR READ

WHILE NOT EOF(FileName) DO
    READFILE FileName, Line
    LineCount <-- LineCount + 1
    OUTPUT "Line ", LineCount, ": ", Line
ENDWHILE

CLOSEFILE FileName

OUTPUT "Total lines read: ", LineCount`
  },
  {
    title: 'File Operations - Writing',
    code: `// Write student names to file
DECLARE OutputFile : STRING
DECLARE StudentName : STRING
DECLARE Count, i : INTEGER

OutputFile <-- "students.txt"
Count <-- 3

OPENFILE OutputFile FOR WRITE

FOR i <-- 1 TO Count
    OUTPUT "Enter student name ", i, ": "
    INPUT StudentName
    WRITEFILE OutputFile, StudentName
NEXT i

CLOSEFILE OutputFile

OUTPUT "Successfully wrote ", Count, " names to ", OutputFile
OUTPUT "Use the Download button to save the file"`
  },
  {
    title: 'File Operations - Processing Grades',
    code: `// Read grades, calculate statistics, write report
DECLARE InputFile, OutputFile : STRING
DECLARE Grade, Total, Count : INTEGER
DECLARE Average : REAL
DECLARE Highest, Lowest : INTEGER

InputFile <-- "grades.txt"
OutputFile <-- "report.txt"
Total <-- 0
Count <-- 0
Highest <-- 0
Lowest <-- 100

OPENFILE InputFile FOR READ

// Read all grades and calculate statistics
WHILE NOT EOF(InputFile) DO
    READFILE InputFile, Grade
    Total <-- Total + Grade
    Count <-- Count + 1
    
    IF Grade > Highest THEN
        Highest <-- Grade
    ENDIF
    
    IF Grade < Lowest THEN
        Lowest <-- Grade
    ENDIF
    
    OUTPUT "Read grade: ", Grade
ENDWHILE

CLOSEFILE InputFile

// Calculate average
IF Count > 0 THEN
    Average <-- REAL(Total) / REAL(Count)
ELSE
    Average <-- 0.0
ENDIF

// Write report
OPENFILE OutputFile FOR WRITE

WRITEFILE OutputFile, "Grade Statistics Report"
WRITEFILE OutputFile, "======================="
WRITEFILE OutputFile, "Total grades: " & STRING(Count)
WRITEFILE OutputFile, "Average: " & STRING(ROUND(Average, 2))
WRITEFILE OutputFile, "Highest: " & STRING(Highest)
WRITEFILE OutputFile, "Lowest: " & STRING(Lowest)

CLOSEFILE OutputFile

OUTPUT ""
OUTPUT "Report generated successfully!"
OUTPUT "Average grade: ", ROUND(Average, 2)
OUTPUT "Download report.txt to see full report"`
  },
  {
    title: 'File Operations - Append to Log',
    code: `// Add entries to a log file
DECLARE LogFile, Entry, Action : STRING
DECLARE Timestamp, Counter : INTEGER
DECLARE ContinueLogging : BOOLEAN

LogFile <-- "activity.log"
Counter <-- 1
ContinueLogging <-- TRUE

OPENFILE LogFile FOR APPEND

WRITEFILE LogFile, "=== New Session Started ==="

WHILE ContinueLogging = TRUE AND Counter <= 5 DO
    OUTPUT "Enter log entry ", Counter, " (or 'DONE' to finish): "
    INPUT Entry
    
    IF Entry = "DONE" THEN
        ContinueLogging <-- FALSE
    ELSE
        Timestamp <-- Counter * 1000
        Action <-- "[" & STRING(Timestamp) & "] " & Entry
        WRITEFILE LogFile, Action
        OUTPUT "Logged: ", Action
        Counter <-- Counter + 1
    ENDIF
ENDWHILE

WRITEFILE LogFile, "=== Session Ended ==="

CLOSEFILE LogFile

OUTPUT ""
OUTPUT "Log file updated successfully"
OUTPUT "Download activity.log to view all entries"`
  },
  {
    title: 'Memory Management - Pointers Basics',
    code: `// Introduction to pointers and memory addresses
DECLARE x, y : INTEGER
DECLARE intPtr, anotherPtr : POINTER_TO_INTEGER

// Initialize variables
x <-- 42
y <-- 99

// Get addresses of variables
intPtr <-- &x
anotherPtr <-- &y

OUTPUT "=== Pointer Basics Demo ==="
OUTPUT "x = ", x, " at address ", intPtr
OUTPUT "y = ", y, " at address ", anotherPtr

// Read values through pointers
OUTPUT "Reading through pointers:"
OUTPUT "*intPtr = ", *intPtr
OUTPUT "*anotherPtr = ", *anotherPtr

// Modify values through pointers
OUTPUT "Modifying through pointers:"
*intPtr <-- 100
*anotherPtr <-- 200

OUTPUT "After modification:"
OUTPUT "x = ", x
OUTPUT "y = ", y

// Pointer assignment (anotherPtr now points to x)
anotherPtr <-- intPtr
OUTPUT "anotherPtr now points to x"
OUTPUT "*anotherPtr = ", *anotherPtr`
  },
  {
    title: 'Dynamic Memory Allocation',
    code: `// MALLOC and FREE operations
DECLARE dynamicArray : POINTER_TO_INTEGER
DECLARE stringMemory : POINTER_TO_CHAR
DECLARE generalPtr : VOID_POINTER
DECLARE i, arraySize, elementSize : INTEGER

OUTPUT "=== Dynamic Memory Allocation Demo ==="

// Get size information
arraySize <-- 5
elementSize <-- SIZE_OF(INTEGER)
OUTPUT "Size of INTEGER: ", elementSize, " bytes"
OUTPUT "Allocating array for ", arraySize, " integers"

// Allocate memory for integer array
dynamicArray <-- MALLOC(elementSize * arraySize)

OUTPUT "Dynamic array allocated at address: ", dynamicArray

// Fill the dynamic array
OUTPUT "Filling array with values:"
FOR i <-- 0 TO arraySize - 1
    *(dynamicArray + (i * elementSize)) <-- (i + 1) * 10
    OUTPUT "Element ", i, ": ", *(dynamicArray + (i * elementSize))
NEXT i

// Allocate memory for string
stringMemory <-- MALLOC(20)  // 20 characters
OUTPUT "String memory allocated at: ", stringMemory

// Use generic pointer
generalPtr <-- dynamicArray
OUTPUT "Generic pointer points to: ", generalPtr

// Clean up - deallocate memory
OUTPUT "Deallocating memory..."
FREE(dynamicArray)
FREE(stringMemory)

OUTPUT "Memory deallocation complete"`
  },
  {
    title: 'Memory Sizes & Types',
    code: `// SIZE_OF function and type information
DECLARE intSize, realSize, charSize, boolSize : INTEGER
DECLARE intPtrSize, realPtrSize, charPtrSize, voidPtrSize : INTEGER
DECLARE totalMemory : INTEGER

OUTPUT "=== Memory Sizes Demo ==="

// Basic data type sizes
intSize <-- SIZE_OF(INTEGER)
realSize <-- SIZE_OF(REAL)
charSize <-- SIZE_OF(CHAR)
boolSize <-- SIZE_OF(BOOLEAN)

OUTPUT "Data Type Sizes:"
OUTPUT "INTEGER: ", intSize, " bytes"
OUTPUT "REAL: ", realSize, " bytes"
OUTPUT "CHAR: ", charSize, " bytes"
OUTPUT "BOOLEAN: ", boolSize, " bytes"

// Pointer type sizes
intPtrSize <-- SIZE_OF(POINTER_TO_INTEGER)
realPtrSize <-- SIZE_OF(POINTER_TO_REAL)
charPtrSize <-- SIZE_OF(POINTER_TO_CHAR)
voidPtrSize <-- SIZE_OF(VOID_POINTER)

OUTPUT ""
OUTPUT "Pointer Type Sizes:"
OUTPUT "POINTER_TO_INTEGER: ", intPtrSize, " bytes"
OUTPUT "POINTER_TO_REAL: ", realPtrSize, " bytes"
OUTPUT "POINTER_TO_CHAR: ", charPtrSize, " bytes"
OUTPUT "VOID_POINTER: ", voidPtrSize, " bytes"

// Calculate memory requirements
totalMemory <-- intSize + realSize + charSize + intPtrSize
OUTPUT ""
OUTPUT "Total memory for sample structure: ", totalMemory, " bytes"

// Demonstrate hexadecimal addresses
DECLARE variables : ARRAY[1:4] OF INTEGER
DECLARE address : POINTER_TO_INTEGER
variables[1] <-- 100
variables[2] <-- 200
variables[3] <-- 300
variables[4] <-- 400

OUTPUT ""
OUTPUT "Array element addresses:"
address <-- &variables[1]
OUTPUT "variables[1] at: ", address, " value: ", *address
address <-- &variables[2]
OUTPUT "variables[2] at: ", address, " value: ", *address
address <-- &variables[3]
OUTPUT "variables[3] at: ", address, " value: ", *address
address <-- &variables[4]
OUTPUT "variables[4] at: ", address, " value: ", *address`
  },
  {
    title: 'Linked List Implementation',
    code: `// Simple linked list using static arrays and pointers
DECLARE data : ARRAY[1:6] OF INTEGER
DECLARE nextNode : ARRAY[1:6] OF INTEGER
DECLARE head, current, temp : POINTER_TO_INTEGER
DECLARE i, nodeIndex : INTEGER

OUTPUT "=== Linked List Demo ==="

// Initialize linked list nodes (simplified static implementation)
data[1] <-- 10
nextNode[1] <-- 2
data[2] <-- 20
nextNode[2] <-- 3
data[3] <-- 30
nextNode[3] <-- 4
data[4] <-- 40
nextNode[4] <-- 5
data[5] <-- 50
nextNode[5] <-- 0  // NULL pointer
data[6] <-- 0
nextNode[6] <-- 0  // Empty node

// Set head pointer to first node
head <-- &data[1]
OUTPUT "List created, head points to address: ", head

// Traverse the list
OUTPUT ""
OUTPUT "Traversing linked list:"
current <-- head
nodeIndex <-- 1

WHILE current <> 0 AND nodeIndex <= 5 DO
    OUTPUT "Node ", nodeIndex, ": value = ", *current, " next = ", nextNode[nodeIndex]

    // Move to next node
    IF nextNode[nodeIndex] <> 0 THEN
        current <-- &data[nextNode[nodeIndex]]
        nodeIndex <-- nextNode[nodeIndex]
    ELSE
        current <-- 0  // End of list
    ENDIF
ENDWHILE

// Demonstrate inserting a node (at beginning)
OUTPUT ""
OUTPUT "Inserting new node at beginning:"
data[6] <-- 5
nextNode[6] <-- 1
head <-- &data[6]

// Traverse again to show insertion
OUTPUT "List after insertion:"
current <-- head
nodeIndex <-- 6

WHILE current <> 0 AND nodeIndex <= 6 DO
    OUTPUT "Node ", nodeIndex, ": value = ", *current, " next = ", nextNode[nodeIndex]

    IF nextNode[nodeIndex] <> 0 AND nextNode[nodeIndex] <= 6 THEN
        current <-- &data[nextNode[nodeIndex]]
        nodeIndex <-- nextNode[nodeIndex]
    ELSE
        current <-- 0
    ENDIF
ENDWHILE`
  },
  {
    title: 'Binary Tree Traversal',
    code: `// Binary tree with simplified traversal
DECLARE treeData : ARRAY[1:7] OF INTEGER
DECLARE leftChild : ARRAY[1:7] OF INTEGER
DECLARE rightChild : ARRAY[1:7] OF INTEGER
DECLARE root, current : POINTER_TO_INTEGER
DECLARE i, nodeNum : INTEGER

OUTPUT "=== Binary Tree Demo ==="

// Initialize binary tree
treeData[1] <-- 50
leftChild[1] <-- 2
rightChild[1] <-- 3
treeData[2] <-- 30
leftChild[2] <-- 4
rightChild[2] <-- 5
treeData[3] <-- 70
leftChild[3] <-- 6
rightChild[3] <-- 7
treeData[4] <-- 20
leftChild[4] <-- 0
rightChild[4] <-- 0
treeData[5] <-- 40
leftChild[5] <-- 0
rightChild[5] <-- 0
treeData[6] <-- 60
leftChild[6] <-- 0
rightChild[6] <-- 0
treeData[7] <-- 80
leftChild[7] <-- 0
rightChild[7] <-- 0

OUTPUT "Binary tree structure:"
OUTPUT "        50"
OUTPUT "       /  \\"
OUTPUT "     30    70"
OUTPUT "    / \\   / \\"
OUTPUT "  20 40 60 80"

// Set root pointer
root <-- &treeData[1]
OUTPUT "Root pointer: ", root, " value: ", *root

// Simplified in-order traversal without recursive procedures
OUTPUT ""
OUTPUT "In-order traversal (Left, Root, Right):"

// Simulate in-order traversal iteratively
nodeNum <-- 1
current <-- &treeData[1]

// Process left subtree (node 2)
OUTPUT "Processing left subtree of node ", treeData[1]
nodeNum <-- 2
current <-- &treeData[2]

// Process left subtree of node 2 (node 4)
OUTPUT "Processing left subtree of node ", treeData[2]
nodeNum <-- 4
current <-- &treeData[4]
OUTPUT "Leaf node: ", *current

// Process node 2 itself
nodeNum <-- 2
current <-- &treeData[2]
OUTPUT "Visited node: ", *current

// Process right subtree of node 2 (node 5)
nodeNum <-- 5
current <-- &treeData[5]
OUTPUT "Leaf node: ", *current

// Process root node (node 1)
nodeNum <-- 1
current <-- &treeData[1]
OUTPUT "Visited root: ", *current

// Process right subtree (node 3)
OUTPUT "Processing right subtree of node ", treeData[1]
nodeNum <-- 3
current <-- &treeData[3]

// Process left subtree of node 3 (node 6)
OUTPUT "Processing left subtree of node ", treeData[3]
nodeNum <-- 6
current <-- &treeData[6]
OUTPUT "Leaf node: ", *current

// Process node 3 itself
nodeNum <-- 3
current <-- &treeData[3]
OUTPUT "Visited node: ", *current

// Process right subtree of node 3 (node 7)
nodeNum <-- 7
current <-- &treeData[7]
OUTPUT "Leaf node: ", *current

OUTPUT ""
OUTPUT "Tree traversal complete!"
OUTPUT "In-order sequence: 20, 30, 40, 50, 60, 70, 80"`
  },
  {
    title: 'Advanced Memory Operations',
    code: `// Advanced pointer operations and memory management
DECLARE numbers : ARRAY[1:8] OF INTEGER
DECLARE letters : ARRAY[1:4] OF CHAR
DECLARE intPtr : POINTER_TO_INTEGER
DECLARE charPtr : POINTER_TO_CHAR
DECLARE voidPtr : VOID_POINTER
DECLARE tempInt : INTEGER
DECLARE tempChar : CHAR
DECLARE i, offset : INTEGER

OUTPUT "=== Advanced Memory Operations Demo ==="

// Initialize arrays
FOR i <-- 1 TO 8
    numbers[i] <-- i * 10
NEXT i

letters[1] <-- 'A'
letters[2] <-- 'B'
letters[3] <-- 'C'
letters[4] <-- 'D'

OUTPUT "Initialized data:"
OUTPUT "Numbers: ", numbers[1], " ", numbers[2], " ", numbers[3], " ", numbers[4]
OUTPUT "Letters: ", letters[1], " ", letters[2], " ", letters[3], " ", letters[4]

// Pointer operations with different types
intPtr <-- &numbers[3]
charPtr <-- &letters[2]
voidPtr <-- &numbers[5]

OUTPUT ""
OUTPUT "Pointer operations:"
OUTPUT "intPtr points to numbers[3]: ", intPtr, " value: ", *intPtr
OUTPUT "charPtr points to letters[2]: ", charPtr, " value: ", *charPtr
OUTPUT "voidPtr points to numbers[5]: ", voidPtr

// Pointer arithmetic (simplified)
OUTPUT ""
OUTPUT "Pointer arithmetic:"
OUTPUT "Current *intPtr: ", *intPtr
OUTPUT "Moving to next element..."

// Simulate pointer arithmetic (conceptual)
offset <-- SIZE_OF(INTEGER)
OUTPUT "Size of INTEGER: ", offset, " bytes"
OUTPUT "Next element address would be: ", intPtr + offset

// Memory swap using pointers
intPtr <-- &numbers[1]
OUTPUT ""
OUTPUT "Before swap: numbers[1] = ", *intPtr
tempInt <-- *intPtr
*intPtr <-- numbers[8]
OUTPUT "After swap: numbers[1] = ", *intPtr

// Character manipulation
charPtr <-- &letters[1]
OUTPUT ""
OUTPUT "Before: letters[1] = ", *charPtr
tempChar <-- *charPtr
*charPtr <-- 'Z'
OUTPUT "After: letters[1] = ", *charPtr

// Demonstrating memory layout
OUTPUT ""
OUTPUT "Memory layout information:"
intPtr <-- &numbers[1]
OUTPUT "Array 'numbers' starts at: ", intPtr

charPtr <-- &letters[1]
OUTPUT "Array 'letters' starts at: ", charPtr

// Multiple pointers to same data
intPtr <-- &numbers[4]
DECLARE anotherPtr : POINTER_TO_INTEGER
anotherPtr <-- intPtr

OUTPUT ""
OUTPUT "Multiple pointers to same data:"
OUTPUT "intPtr: ", intPtr, " value: ", *intPtr
OUTPUT "anotherPtr: ", anotherPtr, " value: ", *anotherPtr

*intPtr <-- 999
OUTPUT "After modifying through intPtr:"
OUTPUT "*intPtr: ", *intPtr
OUTPUT "*anotherPtr: ", *anotherPtr
OUTPUT "numbers[4]: ", numbers[4]

OUTPUT ""
OUTPUT "Advanced memory operations complete!"`
  }
];
