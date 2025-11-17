/**
 * Memory management system for low-level algorithm research environment
 * Simulates array-based RAM with explicit addresses for pointer operations
 */

export interface MemoryBlock {
  address: number;
  size: number;
  type: string;
  allocated: boolean;
}

export interface MemoryAllocations {
  [address: number]: MemoryBlock;
}

export class MemoryEngine {
  private ram: Array<any>;
  private allocated: Set<number>;
  private allocations: Map<number, { size: number; type: string }>;
  private nextFreeAddress: number;
  private memorySize: number;

  // System memory layout (first 1KB reserved)
  private readonly SYSTEM_RESERVED = 1024;

  constructor(size: number = 65536) {
    this.ram = new Array(size).fill(undefined);
    this.allocated = new Set();
    this.allocations = new Map();
    this.nextFreeAddress = this.SYSTEM_RESERVED;
    this.memorySize = size;
  }

  /**
   * Allocate a contiguous block of memory
   * @param size Number of memory units to allocate
   * @param type Type of data being stored
   * @returns Starting address of allocated block
   */
  allocate(size: number, type: string): number {
    if (size <= 0) {
      throw new Error(`Memory allocation error: size must be positive, got ${size}`);
    }

    const address = this.findFreeBlock(size);
    this.markAllocated(address, size, type);
    return address;
  }

  /**
   * Deallocate a previously allocated memory block
   * @param address Starting address of block to free
   */
  free(address: number): void {
    const allocation = this.allocations.get(address);
    if (!allocation) {
      throw new Error(`Invalid free: address ${address} not allocated`);
    }

    // Clear allocated markers and RAM contents
    for (let i = 0; i < allocation.size; i++) {
      const addr = address + i;
      this.allocated.delete(addr);
      this.ram[addr] = undefined;
    }

    // Remove allocation record
    this.allocations.delete(address);

    // If this was the last allocation, update nextFreeAddress
    if (address + allocation.size >= this.nextFreeAddress) {
      this.recalculateNextFreeAddress();
    }
  }

  /**
   * Read value from memory address
   * @param address Memory address to read from
   * @returns Value stored at address
   */
  read(address: number): any {
    if (address < 0 || address >= this.memorySize) {
      throw new Error(`Memory read error: address ${address} out of bounds (0-${this.memorySize - 1})`);
    }

    if (!this.allocated.has(address)) {
      throw new Error(`Memory read error: address ${address} not allocated`);
    }

    return this.ram[address];
  }

  /**
   * Write value to memory address
   * @param address Memory address to write to
   * @param value Value to store
   */
  write(address: number, value: any): void {
    if (address < 0 || address >= this.memorySize) {
      throw new Error(`Memory write error: address ${address} out of bounds (0-${this.memorySize - 1})`);
    }

    if (!this.allocated.has(address)) {
      throw new Error(`Memory write error: address ${address} not allocated`);
    }

    this.ram[address] = value;
  }

  /**
   * Check if address is allocated
   * @param address Memory address to check
   * @returns True if address is allocated
   */
  isAllocated(address: number): boolean {
    return this.allocated.has(address);
  }

  /**
   * Get allocation information for an address
   * @param address Memory address
   * @returns Allocation block info or null if not allocated
   */
  getAllocation(address: number): { size: number; type: string } | null {
    // Check if this address is the start of an allocation
    const allocation = this.allocations.get(address);
    if (allocation) {
      return allocation;
    }

    // Search backwards to find the allocation that contains this address
    for (const [allocAddress, alloc] of this.allocations) {
      if (address >= allocAddress && address < allocAddress + alloc.size) {
        return alloc;
      }
    }

    return null;
  }

  /**
   * Get all allocations for debugging/visualization
   * @returns Array of allocation information
   */
  getAllAllocations(): Array<{ address: number; size: number; type: string }> {
    const allocations = [];
    for (const [address, allocation] of this.allocations) {
      allocations.push({
        address,
        size: allocation.size,
        type: allocation.type
      });
    }
    return allocations.sort((a, b) => a.address - b.address);
  }

  /**
   * Get size of a data type in memory units
   * @param type Data type name
   * @returns Size in memory units
   */
  getTypeSize(type: string): number {
    const sizes: { [key: string]: number } = {
      'INTEGER': 1,
      'REAL': 1,
      'CHAR': 1,
      'BOOLEAN': 1,
      'STRING': 1, // Simplified: stores reference to string
      'POINTER_TO_INTEGER': 1,
      'POINTER_TO_REAL': 1,
      'POINTER_TO_CHAR': 1,
      'VOID_POINTER': 1
    };

    // Handle array types
    if (type.startsWith('ARRAY')) {
      return 1; // Simplified: arrays are contiguous blocks
    }

    const size = sizes[type];
    if (size === undefined) {
      throw new Error(`Unknown data type: ${type}`);
    }

    return size;
  }

  /**
   * Generate hex dump of memory region for visualization
   * @param startAddress Starting address
   * @param size Number of memory units to dump
   * @returns Formatted hex dump string
   */
  generateHexDump(startAddress: number, size: number = 256): string {
    let dump = `Memory Hex Dump (0x${startAddress.toString(16).toUpperCase()} - 0x${(startAddress + size - 1).toString(16).toUpperCase()})\n`;
    dump += "=" .repeat(70) + "\n";

    for (let addr = startAddress; addr < startAddress + size; addr += 16) {
      // Address column
      dump += `0x${addr.toString(16).toUpperCase().padStart(4, '0')}: `;

      // Hex bytes
      const hexBytes = [];
      for (let i = 0; i < 16 && addr + i < startAddress + size; i++) {
        const memAddr = addr + i;
        if (this.isAllocated(memAddr)) {
          const value = this.ram[memAddr];
          const hexVal = value !== undefined ? value.toString(16).padStart(2, '0').toUpperCase().slice(-2) : '??';
          hexBytes.push(hexVal);
        } else {
          hexBytes.push('..');
        }
      }

      // Format hex bytes with spacing
      for (let i = 0; i < 16; i += 8) {
        dump += hexBytes.slice(i, i + 8).join(' ') + '  ';
      }

      // ASCII representation (simplified)
      dump += ' |';
      for (let i = 0; i < 16 && addr + i < startAddress + size; i++) {
        const memAddr = addr + i;
        if (this.isAllocated(memAddr) && this.ram[memAddr] !== undefined) {
          const val = this.ram[memAddr];
          const char = typeof val === 'number' && val >= 32 && val <= 126 ? String.fromCharCode(val) : '.';
          dump += char;
        } else {
          dump += '.';
        }
      }
      dump += '|\n';
    }

    return dump;
  }

  /**
   * Reset memory engine to initial state
   */
  reset(): void {
    this.ram.fill(undefined);
    this.allocated.clear();
    this.allocations.clear();
    this.nextFreeAddress = this.SYSTEM_RESERVED;
  }

  /**
   * Get memory usage statistics
   * @returns Memory usage information
   */
  getMemoryStats(): { total: number; allocated: number; free: number; blocks: number } {
    const allocated = this.allocated.size;
    const free = this.memorySize - allocated;
    const blocks = this.allocations.size;

    return {
      total: this.memorySize,
      allocated,
      free,
      blocks
    };
  }

  // Private helper methods

  /**
   * Find a contiguous free block of memory
   * @param size Size of block to find
   * @returns Starting address of free block
   */
  private findFreeBlock(size: number): number {
    // Simple strategy: use nextFreeAddress and ensure enough contiguous space
    let address = this.nextFreeAddress;

    while (address + size <= this.memorySize) {
      let canAllocate = true;

      // Check if all addresses in the range are free
      for (let i = 0; i < size; i++) {
        if (this.allocated.has(address + i)) {
          canAllocate = false;
          address = address + i + 1; // Skip past this allocated block
          break;
        }
      }

      if (canAllocate) {
        return address;
      }
    }

    throw new Error(`Memory allocation error: cannot find contiguous block of size ${size}`);
  }

  /**
   * Mark a range of addresses as allocated
   * @param address Starting address
   * @param size Size of allocation
   * @param type Type of data
   */
  private markAllocated(address: number, size: number, type: string): void {
    for (let i = 0; i < size; i++) {
      this.allocated.add(address + i);
    }

    this.allocations.set(address, { size, type });
    this.nextFreeAddress = Math.max(this.nextFreeAddress, address + size);
  }

  /**
   * Recalculate the next free address after deallocation
   */
  private recalculateNextFreeAddress(): void {
    let maxEnd = this.SYSTEM_RESERVED;
    for (const [address, allocation] of this.allocations) {
      maxEnd = Math.max(maxEnd, address + allocation.size);
    }
    this.nextFreeAddress = maxEnd;
  }
}