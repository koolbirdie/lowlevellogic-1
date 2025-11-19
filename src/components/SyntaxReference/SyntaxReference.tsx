import { useState } from 'react';
import styles from './SyntaxReference.module.css';

interface SyntaxItem {
  category: string;
  items: {
    title: string;
    syntax: string;
    example: string;
    description: string;
  }[];
}

const syntaxData: SyntaxItem[] = [
  {
    category: 'Variables & Data Types',
    items: [
      {
        title: 'DECLARE',
        syntax: 'DECLARE <identifier> : <data type>',
        example: 'DECLARE Age : INTEGER\nDECLARE Name : STRING',
        description: 'Declares a variable with a specific data type (INTEGER, REAL, STRING, CHAR, BOOLEAN)',
      },
      {
        title: 'Assignment',
        syntax: '<identifier> <- <value>',
        example: 'Age <- 16\nName <- "Alice"',
        description: 'Assigns a value to a variable using the <- operator',
      },
      {
        title: 'Arrays',
        syntax: 'DECLARE <identifier> : ARRAY[<lower>:<upper>] OF <type>',
        example: 'DECLARE Numbers : ARRAY[1:10] OF INTEGER\nNumbers[5] <- 42',
        description: 'Declares an array with lower and upper bounds (1-indexed)',
      },
    ],
  },
  {
    category: 'Input & Output',
    items: [
      {
        title: 'INPUT',
        syntax: 'INPUT <identifier>',
        example: 'DECLARE Number : INTEGER\nINPUT Number',
        description: 'Reads input from the user into a variable',
      },
      {
        title: 'OUTPUT',
        syntax: 'OUTPUT <value>, <value>, ...',
        example: 'OUTPUT "Hello, ", Name\nOUTPUT "Sum: ", Total',
        description: 'Displays output to the screen. Can output multiple values separated by commas',
      },
    ],
  },
  {
    category: 'Selection',
    items: [
      {
        title: 'IF Statement',
        syntax: 'IF <condition> THEN\n    <statements>\nENDIF',
        example: 'IF Age >= 18 THEN\n    OUTPUT "Adult"\nENDIF',
        description: 'Executes statements only if condition is true',
      },
      {
        title: 'IF-ELSE Statement',
        syntax: 'IF <condition> THEN\n    <statements>\nELSE\n    <statements>\nENDIF',
        example: 'IF Score >= 50 THEN\n    OUTPUT "Pass"\nELSE\n    OUTPUT "Fail"\nENDIF',
        description: 'Executes first block if true, else block if false',
      },
      {
        title: 'CASE Statement',
        syntax: 'CASE OF <identifier>\n    <value> : <statements>\n    OTHERWISE : <statements>\nENDCASE',
        example: 'CASE OF Grade\n    "A" : OUTPUT "Excellent"\n    "B" : OUTPUT "Good"\n    OTHERWISE : OUTPUT "Other"\nENDCASE',
        description: 'Multi-way selection based on value',
      },
    ],
  },
  {
    category: 'Iteration',
    items: [
      {
        title: 'FOR Loop',
        syntax: 'FOR <identifier> <- <start> TO <end>\n    <statements>\nNEXT <identifier>',
        example: 'FOR i <- 1 TO 10\n    OUTPUT i\nNEXT i',
        description: 'Repeats for a fixed number of iterations',
      },
      {
        title: 'FOR with STEP',
        syntax: 'FOR <identifier> <- <start> TO <end> STEP <increment>\n    <statements>\nNEXT <identifier>',
        example: 'FOR i <- 0 TO 100 STEP 10\n    OUTPUT i\nNEXT i',
        description: 'Loop with custom increment value',
      },
      {
        title: 'WHILE Loop',
        syntax: 'WHILE <condition> DO\n    <statements>\nENDWHILE',
        example: 'WHILE Count < 10 DO\n    Count <- Count + 1\nENDWHILE',
        description: 'Repeats while condition is true (checks before execution)',
      },
      {
        title: 'REPEAT Loop',
        syntax: 'REPEAT\n    <statements>\nUNTIL <condition>',
        example: 'REPEAT\n    Count <- Count + 1\nUNTIL Count = 10',
        description: 'Repeats until condition is true (checks after execution)',
      },
    ],
  },
  {
    category: 'Procedures & Functions',
    items: [
      {
        title: 'PROCEDURE',
        syntax: 'PROCEDURE <identifier>(<parameters>)\n    <statements>\nENDPROCEDURE',
        example: 'PROCEDURE Greet(Name : STRING)\n    OUTPUT "Hello, ", Name\nENDPROCEDURE',
        description: 'Defines a reusable block of code without return value',
      },
      {
        title: 'CALL Procedure',
        syntax: 'CALL <identifier>(<arguments>)',
        example: 'CALL Greet("Alice")',
        description: 'Executes a procedure',
      },
      {
        title: 'FUNCTION',
        syntax: 'FUNCTION <identifier>(<parameters>) RETURNS <type>\n    <statements>\n    RETURN <value>\nENDFUNCTION',
        example: 'FUNCTION Square(N : INTEGER) RETURNS INTEGER\n    RETURN N * N\nENDFUNCTION',
        description: 'Defines a reusable block of code that returns a value',
      },
      {
        title: 'Parameters',
        syntax: 'BYVAL <identifier> : <type>\nBYREF <identifier> : <type>',
        example: 'PROCEDURE Test(BYVAL X : INTEGER, BYREF Y : INTEGER)\n    Y <- X * 2\nENDPROCEDURE',
        description: 'BYVAL passes a copy, BYREF passes reference (can modify original)',
      },
    ],
  },
  {
    category: 'Operators',
    items: [
      {
        title: 'Arithmetic',
        syntax: '+ - * / DIV MOD',
        example: 'Result <- 10 DIV 3  // 3\nRemainder <- 10 MOD 3  // 1',
        description: 'DIV for integer division, MOD for remainder',
      },
      {
        title: 'Comparison',
        syntax: '= <> < > <= >=',
        example: 'IF Age >= 18 THEN\n    OUTPUT "Adult"\nENDIF',
        description: '= equals, <> not equals',
      },
      {
        title: 'Logical',
        syntax: 'AND OR NOT',
        example: 'IF Age >= 18 AND Age < 65 THEN\n    OUTPUT "Working age"\nENDIF',
        description: 'Combine conditions with AND, OR, NOT',
      },
    ],
  },
  {
    category: 'Pointers & Memory Management',
    items: [
      {
        title: 'Pointer Declaration',
        syntax: 'DECLARE <identifier> : POINTER_TO_<type>\nDECLARE <identifier> : VOID_POINTER',
        example: 'DECLARE intPtr : POINTER_TO_INTEGER\nDECLARE charPtr : POINTER_TO_CHAR\nDECLARE genericPtr : VOID_POINTER',
        description: 'Declares a pointer variable that can store memory addresses of specific data types. VOID_POINTER can point to any type.',
      },
      {
        title: 'Address Operator (&)',
        syntax: '<pointer_variable> <- &<variable>',
        example: 'DECLARE x : INTEGER\nDECLARE intPtr : POINTER_TO_INTEGER\nintPtr <- &x  // Get address of x',
        description: 'Gets the memory address of a variable and stores it in a pointer variable.',
      },
      {
        title: 'Dereference Operator (*)',
        syntax: '*<pointer_variable>',
        example: 'DECLARE x, value : INTEGER\nDECLARE intPtr : POINTER_TO_INTEGER\nintPtr <- &x\n*intPtr <- 42  // Modify x through pointer\nvalue <- *intPtr  // Read x through pointer',
        description: 'Accesses or modifies the value stored at the memory address pointed to by a pointer.',
      },
      {
        title: 'MALLOC',
        syntax: '<pointer_variable> <- MALLOC(<size_in_bytes>)',
        example: 'DECLARE dynamicArray : POINTER_TO_INTEGER\nDECLARE arraySize, elementSize : INTEGER\narraySize <- 10\nelementSize <- SIZE_OF(INTEGER)\ndynamicArray <- MALLOC(elementSize * arraySize)',
        description: 'Allocates dynamic memory and returns a pointer to the allocated block. Size must be specified in bytes.',
      },
      {
        title: 'FREE',
        syntax: 'FREE(<pointer_variable>)',
        example: 'DECLARE dynamicArray : POINTER_TO_INTEGER\ndynamicArray <- MALLOC(40)\n// Use the allocated memory\nFREE(dynamicArray)  // Deallocate to prevent memory leaks',
        description: 'Deallocates previously allocated memory to prevent memory leaks. Always call FREE() after using MALLOC().',
      },
      {
        title: 'SIZE_OF',
        syntax: 'SIZE_OF(<type_or_pointer_type>)',
        example: 'DECLARE intSize, ptrSize : INTEGER\nintSize <- SIZE_OF(INTEGER)  // Returns bytes for INTEGER\nptrSize <- SIZE_OF(POINTER_TO_INTEGER)  // Returns pointer size',
        description: 'Returns the size in bytes of a data type or pointer type. Useful for calculating memory allocation sizes.',
      },
      {
        title: 'Pointer Assignment',
        syntax: '<pointer2> <- <pointer1>',
        example: 'DECLARE ptr1, ptr2 : POINTER_TO_INTEGER\nDECLARE x : INTEGER\nptr1 <- &x\nptr2 <- ptr1  // Both pointers now point to x\n*ptr2 <- 99  // Modifies x through either pointer',
        description: 'Assigns one pointer to another. Both pointers will point to the same memory location.',
      },
      {
        title: 'Pointer Types',
        syntax: 'POINTER_TO_INTEGER\nPOINTER_TO_REAL\nPOINTER_TO_CHAR\nVOID_POINTER',
        example: 'DECLARE intPtr : POINTER_TO_INTEGER\nDECLARE realPtr : POINTER_TO_REAL\nDECLARE charPtr : POINTER_TO_CHAR\nDECLARE genericPtr : VOID_POINTER',
        description: 'Available pointer types. Each pointer type can only point to its corresponding data type, except VOID_POINTER which can point to any type.',
      },
    ],
  },
  {
    category: 'Built-in Functions',
    items: [
      {
        title: 'String Functions',
        syntax: 'LENGTH(<string>)\nSUBSTRING(<string>, <start>, <length>)\nUCASE(<string>)\nLCASE(<string>)',
        example: 'Len <- LENGTH("Hello")  // 5\nSub <- SUBSTRING("Hello", 1, 3)  // "Hel"',
        description: 'String manipulation functions',
      },
      {
        title: 'Type Conversion',
        syntax: 'INT(<value>)\nREAL(<value>)\nSTRING(<value>)',
        example: 'X <- INT(3.7)  // 3\nY <- STRING(42)  // "42"',
        description: 'Convert between data types',
      },
      {
        title: 'Math Functions',
        syntax: 'ROUND(<number>, <decimals>)\nRANDOM()',
        example: 'R <- ROUND(3.14159, 2)  // 3.14\nRand <- RANDOM()  // 0.0-1.0',
        description: 'Mathematical operations',
      },
    ],
  },
];

interface SyntaxReferenceProps {
  onClose: () => void;
}

export default function SyntaxReference({ onClose }: SyntaxReferenceProps) {
  const [selectedCategory, setSelectedCategory] = useState(syntaxData[0].category);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = syntaxData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.items.length > 0);

  const currentCategory = filteredData.find(cat => cat.category === selectedCategory) || filteredData[0];

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2>Syntax Reference</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search syntax..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            {filteredData.map((category) => (
              <button
                key={category.category}
                className={`${styles.categoryButton} ${
                  selectedCategory === category.category ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.category)}
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className={styles.main}>
            {currentCategory && currentCategory.items.map((item) => (
              <div key={item.title} className={styles.syntaxItem}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDescription}>{item.description}</p>

                <div className={styles.syntaxBox}>
                  <div className={styles.syntaxLabel}>Syntax:</div>
                  <pre className={styles.syntaxCode}>{item.syntax}</pre>
                </div>

                <div className={styles.exampleBox}>
                  <div className={styles.exampleLabel}>Example:</div>
                  <pre className={styles.exampleCode}>{item.example}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
