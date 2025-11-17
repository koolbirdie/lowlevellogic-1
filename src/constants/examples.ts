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

OUTPUT "Memory simulation complete!"
  }
];
