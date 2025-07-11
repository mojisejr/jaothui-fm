# Farm Management System - Testing Guidelines

## 🧪 Testing Strategy Overview

### Testing Pyramid Approach

```
                    Manual Testing
                   /              \
              E2E Testing        Manual UI Testing
             /          \       /              \
      Integration    Component Testing    Mobile Testing
     /           \   /              \   /              \
Unit Testing  API Testing    Form Testing    Responsive Testing
```

### Testing Philosophy

- **Quality First**: Every feature must pass automated and manual tests
- **Mobile-First**: All tests prioritize 400px width mobile experience
- **User-Centric**: Test user workflows, not just individual functions
- **Thai Language**: Error messages and user feedback in Thai
- **Performance Aware**: Test for mobile performance and loading states

## 🔧 Test Environment Setup

### Required Testing Tools

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "node-mocks-http": "^1.12.2",
    "msw": "^1.3.2"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### Test Setup File

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 🧩 Component Testing Patterns

### Basic Component Testing

```tsx
// Example: AnimalCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimalCard } from '@/components/ui/animal-card';
import type { Animal } from '@prisma/client';

const mockAnimal: Animal = {
  id: 'animal-123',
  animalId: 'BF20250101001',
  animalType: 'BUFFALO',
  name: 'ทองคำ',
  birthDate: new Date('2024-01-01'),
  sex: 'MALE',
  farmId: 'farm-123',
  color: 'black',
  weightKg: 500,
  heightCm: 150,
  motherName: null,
  fatherName: null,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('AnimalCard', () => {
  it('renders animal information correctly', () => {
    render(<AnimalCard animal={mockAnimal} />);
    
    // Test display of animal data
    expect(screen.getByText('ทองคำ')).toBeInTheDocument();
    expect(screen.getByText('BF20250101001')).toBeInTheDocument();
    expect(screen.getByText('🐃')).toBeInTheDocument(); // Buffalo emoji
  });

  it('handles missing image with placeholder', () => {
    render(<AnimalCard animal={mockAnimal} />);
    
    // Should show placeholder instead of image
    expect(screen.getByText('🐃')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const onClickMock = jest.fn();
    render(<AnimalCard animal={mockAnimal} onClick={onClickMock} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalledWith('animal-123');
  });

  it('displays formatted birth date', () => {
    render(<AnimalCard animal={mockAnimal} />);
    
    // Should format date as DD/MM/YYYY
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
  });
});
```

### Form Component Testing

```tsx
// Example: AnimalForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimalForm } from '@/components/forms/animal-form';
import { toast } from 'sonner';

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('AnimalForm', () => {
  const mockOnSubmit = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required fields', async () => {
    render(<AnimalForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /บันทึก/i });
    fireEvent.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('กรุณากรอกชื่อสัตว์')).toBeInTheDocument();
      expect(screen.getByText('กรุณาเลือกประเภทสัตว์')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<AnimalForm onSubmit={mockOnSubmit} />);
    
    // Fill form fields
    await user.type(screen.getByLabelText(/ชื่อสัตว์/i), 'ทองคำ');
    await user.selectOptions(screen.getByLabelText(/ประเภทสัตว์/i), 'BUFFALO');
    await user.type(screen.getByLabelText(/วันเกิด/i), '2024-01-01');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'ทองคำ',
        animalType: 'BUFFALO',
        birthDate: '2024-01-01'
      });
    });
  });

  it('handles API errors gracefully', async () => {
    const mockSubmitWithError = jest.fn().mockRejectedValue(
      new Error('API Error')
    );
    
    render(<AnimalForm onSubmit={mockSubmitWithError} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/ชื่อสัตว์/i), 'ทองคำ');
    await user.selectOptions(screen.getByLabelText(/ประเภทสัตว์/i), 'BUFFALO');
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/i }));
    
    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'ไม่สามารถบันทึกข้อมูลได้: API Error'
      );
    });
  });

  it('handles loading states correctly', async () => {
    const mockSlowSubmit = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<AnimalForm onSubmit={mockSlowSubmit} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/ชื่อสัตว์/i), 'ทองคำ');
    await user.selectOptions(screen.getByLabelText(/ประเภทสัตว์/i), 'BUFFALO');
    fireEvent.click(screen.getByRole('button', { name: /บันทึก/i }));
    
    // Should show loading state
    expect(screen.getByText('กำลังบันทึก...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Modal/Dialog Testing

```tsx
// Example: ActivityModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityModal } from '@/components/ui/activity-modal';

describe('ActivityModal', () => {
  it('opens and closes correctly', () => {
    const onCloseMock = jest.fn();
    render(
      <ActivityModal 
        isOpen={true} 
        onClose={onCloseMock}
        animalId="animal-123"
      />
    );
    
    // Should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มกิจกรรม')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /ปิด/i }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('handles overlay click to close', () => {
    const onCloseMock = jest.fn();
    render(
      <ActivityModal 
        isOpen={true} 
        onClose={onCloseMock}
        animalId="animal-123"
      />
    );
    
    // Click overlay
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
```

## 🌐 API Testing Patterns

### API Route Testing

```tsx
// Example: animals.api.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/animals/route';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn()
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    animal: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn()
    },
    profile: {
      findUnique: jest.fn()
    }
  }
}));

describe('/api/animals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/animals', () => {
    it('returns animals for authenticated user', async () => {
      // Mock authentication
      (auth as jest.Mock).mockReturnValue({ userId: 'user-123' });
      
      // Mock database response
      const mockAnimals = [
        {
          id: 'animal-1',
          name: 'ทองคำ',
          animalType: 'BUFFALO',
          animalId: 'BF20250101001'
        }
      ];
      
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        ownedFarms: [{ id: 'farm-123' }]
      });
      
      (prisma.animal.findMany as jest.Mock).mockResolvedValue(mockAnimals);
      
      // Create mock request
      const { req, res } = createMocks({ method: 'GET' });
      
      // Call API
      const response = await GET();
      const responseData = await response.json();
      
      // Assertions
      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockAnimals);
      expect(prisma.animal.findMany).toHaveBeenCalledWith({
        where: { farmId: 'farm-123' }
      });
    });

    it('returns 401 for unauthenticated user', async () => {
      // Mock no authentication
      (auth as jest.Mock).mockReturnValue({ userId: null });
      
      const response = await GET();
      const responseData = await response.json();
      
      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authentication required');
    });
  });

  describe('POST /api/animals', () => {
    it('creates animal with valid data', async () => {
      (auth as jest.Mock).mockReturnValue({ userId: 'user-123' });
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        ownedFarms: [{ id: 'farm-123' }]
      });
      
      const mockCreatedAnimal = {
        id: 'animal-new',
        name: 'นาคทอง',
        animalType: 'BUFFALO',
        animalId: 'BF20250101002',
        farmId: 'farm-123'
      };
      
      (prisma.animal.findUnique as jest.Mock).mockResolvedValue(null); // No duplicate
      (prisma.animal.create as jest.Mock).mockResolvedValue(mockCreatedAnimal);
      
      // Create mock request with body
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'นาคทอง',
          animalType: 'BUFFALO',
          animalId: 'BF20250101002'
        }
      });
      
      // Mock request.json()
      const mockRequest = {
        json: () => Promise.resolve({
          name: 'นาคทอง',
          animalType: 'BUFFALO',
          animalId: 'BF20250101002'
        })
      } as Request;
      
      const response = await POST(mockRequest);
      const responseData = await response.json();
      
      expect(response.status).toBe(201);
      expect(responseData.data).toEqual(mockCreatedAnimal);
      expect(responseData.message).toBe('เพิ่มข้อมูลสัตว์เรียบร้อยแล้ว');
    });

    it('validates required fields', async () => {
      (auth as jest.Mock).mockReturnValue({ userId: 'user-123' });
      
      const mockRequest = {
        json: () => Promise.resolve({
          // Missing required name field
          animalType: 'BUFFALO'
        })
      } as Request;
      
      const response = await POST(mockRequest);
      const responseData = await response.json();
      
      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Validation failed');
      expect(responseData.details).toContain(
        expect.objectContaining({
          path: ['name'],
          message: expect.stringContaining('กรุณากรอกชื่อ')
        })
      );
    });
  });
});
```

### Database Integration Testing

```tsx
// Example: animal-operations.integration.test.ts
import { testDb } from './test-helpers/database';
import { createAnimal, getAnimalsForFarm } from '@/lib/animal-operations';

describe('Animal Operations Integration', () => {
  beforeEach(async () => {
    await testDb.cleanup();
    await testDb.seed();
  });

  afterAll(async () => {
    await testDb.cleanup();
    await testDb.disconnect();
  });

  it('creates animal with auto-generated ID', async () => {
    const farmId = 'test-farm-123';
    
    const animalData = {
      name: 'ทองคำ',
      animalType: 'BUFFALO' as const,
      farmId
    };
    
    const createdAnimal = await createAnimal(animalData);
    
    expect(createdAnimal.animalId).toMatch(/^BF\d{8}\d{3}$/);
    expect(createdAnimal.name).toBe('ทองคำ');
    expect(createdAnimal.animalType).toBe('BUFFALO');
  });

  it('prevents duplicate animal IDs within farm', async () => {
    const farmId = 'test-farm-123';
    const animalId = 'BF20250101001';
    
    // Create first animal
    await createAnimal({
      name: 'ทองคำ',
      animalType: 'BUFFALO',
      animalId,
      farmId
    });
    
    // Try to create duplicate
    await expect(
      createAnimal({
        name: 'เงินคำ',
        animalType: 'BUFFALO',
        animalId, // Same ID
        farmId
      })
    ).rejects.toThrow('รหัสสัตว์นี้มีอยู่แล้ว');
  });
});
```

## 📱 Mobile Testing Guidelines

### Responsive Design Testing

```tsx
// Example: mobile-responsive.test.tsx
import { render, screen } from '@testing-library/react';
import { AnimalList } from '@/components/animal-list';

describe('Mobile Responsive Design', () => {
  beforeEach(() => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400
    });
    
    // Mock matchMedia for mobile breakpoints
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('displays correctly on mobile (400px width)', () => {
    render(<AnimalList animals={mockAnimals} />);
    
    // Check mobile-specific styles
    const container = screen.getByTestId('animal-list-container');
    expect(container).toHaveClass('max-w-[400px]');
    expect(container).toHaveClass('mx-auto');
    expect(container).toHaveClass('px-5');
  });

  it('has touch-friendly button sizes (min 44px)', () => {
    render(<AnimalList animals={mockAnimals} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const style = getComputedStyle(button);
      const height = parseInt(style.height);
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });

  it('displays animal cards in mobile layout', () => {
    render(<AnimalList animals={mockAnimals} />);
    
    const cards = screen.getAllByTestId('animal-card');
    cards.forEach(card => {
      expect(card).toHaveClass('w-full');
      expect(card).toHaveClass('mb-4');
    });
  });
});
```

### Touch Interaction Testing

```tsx
// Example: touch-interactions.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SwipeableAnimalCard } from '@/components/ui/swipeable-animal-card';

describe('Touch Interactions', () => {
  it('handles swipe gestures correctly', () => {
    const onSwipeLeftMock = jest.fn();
    const onSwipeRightMock = jest.fn();
    
    render(
      <SwipeableAnimalCard 
        animal={mockAnimal}
        onSwipeLeft={onSwipeLeftMock}
        onSwipeRight={onSwipeRightMock}
      />
    );
    
    const card = screen.getByTestId('swipeable-card');
    
    // Simulate touch swipe left
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }]
    });
    fireEvent.touchMove(card, {
      touches: [{ clientX: 50, clientY: 100 }]
    });
    fireEvent.touchEnd(card);
    
    expect(onSwipeLeftMock).toHaveBeenCalled();
  });

  it('handles long press correctly', () => {
    const onLongPressMock = jest.fn();
    
    render(
      <SwipeableAnimalCard 
        animal={mockAnimal}
        onLongPress={onLongPressMock}
      />
    );
    
    const card = screen.getByTestId('swipeable-card');
    
    // Simulate long press
    fireEvent.touchStart(card);
    
    // Wait for long press duration
    setTimeout(() => {
      fireEvent.touchEnd(card);
      expect(onLongPressMock).toHaveBeenCalled();
    }, 800);
  });
});
```

## 🚀 Performance Testing

### Loading State Testing

```tsx
// Example: loading-states.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AnimalDashboard } from '@/components/animal-dashboard';

describe('Loading States', () => {
  it('shows loading spinner while fetching data', () => {
    // Mock slow API response
    const mockSlowFetch = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 2000))
    );
    
    render(<AnimalDashboard fetchAnimals={mockSlowFetch} />);
    
    // Should show loading state
    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('hides loading state after data loads', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockAnimals);
    
    render(<AnimalDashboard fetchAnimals={mockFetch} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('กำลังโหลด...')).not.toBeInTheDocument();
      expect(screen.getByText('รายการสัตว์')).toBeInTheDocument();
    });
  });

  it('shows error state on fetch failure', async () => {
    const mockFailedFetch = jest.fn().mockRejectedValue(
      new Error('Network error')
    );
    
    render(<AnimalDashboard fetchAnimals={mockFailedFetch} />);
    
    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาดในการโหลดข้อมูล')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ลองใหม่/i })).toBeInTheDocument();
    });
  });
});
```

### Memory Leak Testing

```tsx
// Example: memory-leak.test.tsx
import { render, unmountComponentAtNode } from '@testing-library/react';
import { ActivityForm } from '@/components/forms/activity-form';

describe('Memory Leak Prevention', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
  });

  it('cleans up timers and subscriptions', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<ActivityForm onSubmit={jest.fn()} />);
    
    // Component creates timers and event listeners
    // ...
    
    unmount();
    
    // Should clean up resources
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
```

## 🔄 End-to-End Testing Patterns

### User Workflow Testing

```tsx
// Example: animal-management.e2e.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/page';

describe('Animal Management Workflow', () => {
  const user = userEvent.setup();

  it('completes full animal creation workflow', async () => {
    render(<App />);
    
    // Navigate to animals page
    fireEvent.click(screen.getByText('จัดการสัตว์'));
    
    // Click add animal button
    fireEvent.click(screen.getByText('เพิ่มสัตว์'));
    
    // Fill animal form
    await user.type(screen.getByLabelText('ชื่อสัตว์'), 'ทองคำ');
    await user.selectOptions(screen.getByLabelText('ประเภทสัตว์'), 'BUFFALO');
    await user.type(screen.getByLabelText('วันเกิด'), '2024-01-01');
    
    // Submit form
    fireEvent.click(screen.getByText('บันทึก'));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('เพิ่มข้อมูลสัตว์เรียบร้อยแล้ว')).toBeInTheDocument();
    });
    
    // Verify animal appears in list
    expect(screen.getByText('ทองคำ')).toBeInTheDocument();
    expect(screen.getByText('BF20250101001')).toBeInTheDocument();
  });

  it('completes activity creation workflow', async () => {
    render(<App />);
    
    // Navigate to animal detail
    fireEvent.click(screen.getByText('ทองคำ')); // From previous test
    
    // Open activity form
    fireEvent.click(screen.getByText('เพิ่มกิจกรรม'));
    
    // Fill activity form
    await user.type(screen.getByLabelText('ชื่อกิจกรรม'), 'ตรวจสุขภาพ');
    await user.type(screen.getByLabelText('วันที่ทำกิจกรรม'), '2025-01-15');
    await user.type(screen.getByLabelText('วันที่แจ้งเตือน'), '2025-01-14');
    
    // Submit activity
    fireEvent.click(screen.getByText('บันทึกกิจกรรม'));
    
    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('บันทึกกิจกรรมเรียบร้อยแล้ว')).toBeInTheDocument();
    });
    
    // Verify activity appears in list
    expect(screen.getByText('ตรวจสุขภาพ')).toBeInTheDocument();
  });
});
```

## 📊 Test Coverage & Quality Metrics

### Coverage Requirements

```javascript
// jest.config.js coverage thresholds
module.exports = {
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    'components/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'lib/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### Test Quality Checklist

```markdown
## Test Quality Standards

### ✅ Component Tests
- [ ] Renders correctly with required props
- [ ] Handles missing/optional props gracefully  
- [ ] User interactions work as expected
- [ ] Loading states display correctly
- [ ] Error states handled properly
- [ ] Mobile responsive behavior verified
- [ ] Accessibility requirements met

### ✅ API Tests  
- [ ] Authentication required and working
- [ ] Request validation functions correctly
- [ ] Success responses match expected format
- [ ] Error responses include proper status codes
- [ ] Database operations work as expected
- [ ] Edge cases and error conditions covered

### ✅ Integration Tests
- [ ] User workflows complete successfully
- [ ] Data flows between components correctly
- [ ] API integrations work end-to-end
- [ ] Form submissions and updates work
- [ ] Navigation between pages functions
- [ ] Mobile user experience verified

### ✅ Performance Tests
- [ ] Loading states prevent user confusion
- [ ] Components unmount cleanly
- [ ] No memory leaks in long-running operations
- [ ] API calls don't block UI interactions
- [ ] Mobile performance acceptable
```

## 🎯 Round-Specific Testing Guidelines

### Round 3: Core Pages Structure
**Primary Focus**: Page rendering และ navigation testing
```tsx
// ใช้สำหรับ:
// - Page component rendering tests
// - Navigation flow testing  
// - Mobile responsive layout tests
// - Logo และ branding display tests

// Prompt คำแนะนำ:
"อ่าน TESTING-GUIDELINES.md sections: Component Testing Patterns, Mobile Testing Guidelines สำหรับ test page rendering และ responsive design"
```

### Round 5: Animal Management Interface  
**Primary Focus**: Interface testing และ data display
```tsx
// ใช้สำหรับ:
// - Animal list component testing
// - Animal card display testing
// - Tab navigation testing
// - Mobile interface testing

// Prompt คำแนะนำ:
"อ่าน TESTING-GUIDELINES.md sections: Component Testing Patterns, Touch Interaction Testing สำหรับ test animal interface components"
```

### Round 6: Animal CRUD Operations
**Primary Focus**: Form testing และ validation
```tsx
// ใช้สำหรับ:
// - Animal form validation testing
// - CRUD operation testing
// - Error handling testing
// - Success feedback testing

// Prompt คำแนะนำ:  
"อ่าน TESTING-GUIDELINES.md sections: Form Component Testing, API Testing Patterns สำหรับ test form functionality และ API integration"
```

### Round 7: Activity & Reminder System
**Primary Focus**: Complex form testing และ localStorage
```tsx
// ใช้สำหรับ:
// - Activity form testing with localStorage
// - Reminder system testing
// - Status management testing
// - Modal component testing

// Prompt คำแนะนำ:
"อ่าน TESTING-GUIDELINES.md sections: Form Component Testing, Modal/Dialog Testing สำหรับ test activity forms และ reminder functionality"
```

### Round 7.2: Activity History Enhancement
**Primary Focus**: History display และ pagination testing
```tsx
// ใช้สำหรับ:
// - Activity history component testing
// - Load more functionality testing
// - Buffalo card pattern testing
// - Mobile scroll testing

// Prompt คำแนะนำ:
"อ่าน TESTING-GUIDELINES.md sections: Component Testing Patterns, Performance Testing สำหรับ test history display และ pagination"
```

### Round 7.3: Activity Management Enhancement
**Primary Focus**: Comprehensive activity management testing
```tsx
// ใช้สำหรับ:
// - Activity list page testing with tab navigation
// - Activity detail/edit page testing
// - Activity status management testing
// - Enhanced activity creation form testing
// - End-to-end activity workflow testing

// Prompt คำแนะนำ:
"อ่าน TESTING-GUIDELINES.md sections: End-to-End Testing Patterns, Form Component Testing สำหรับ test comprehensive activity management system"
```

### Round 8: Notification System
**Primary Focus**: Real-time feature testing และ service worker
```tsx
// ใช้สำหรับ:
// - Push notification testing
// - Service worker testing
// - Cron job testing (มอックอัพ)
// - Notification bell component testing

// Prompt คำแนะนำ:
"อ่าน TESTING-GUIDELINES.md sections: End-to-End Testing Patterns, Performance Testing สำหรับ test notification system และ real-time features"
```

## 🛠️ Test Utilities & Helpers

### Common Test Helpers

```tsx
// test-helpers/render-with-providers.tsx
import { render } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ClerkProvider publishableKey="test-key">
        {children}
        <Toaster />
      </ClerkProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// test-helpers/mock-data.ts
export const mockAnimal = {
  id: 'animal-123',
  animalId: 'BF20250101001',
  animalType: 'BUFFALO' as const,
  name: 'ทองคำ',
  birthDate: new Date('2024-01-01'),
  sex: 'MALE' as const,
  farmId: 'farm-123',
  color: 'black',
  weightKg: 500,
  heightCm: 150,
  motherName: null,
  fatherName: null,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockActivity = {
  id: 'activity-123',
  title: 'ตรวจสุขภาพ',
  description: 'ตรวจสุขภาพประจำเดือน',
  activityDate: new Date('2025-01-15'),
  reminderDate: new Date('2025-01-14'),
  status: 'PENDING' as const,
  animalId: 'animal-123',
  farmId: 'farm-123'
};
```

### Mock Service Workers (MSW)

```tsx
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Animals API
  rest.get('/api/animals', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [mockAnimal]
      })
    );
  }),

  rest.post('/api/animals', (req, res, ctx) => {
    return res(
      ctx.json({
        data: { ...mockAnimal, id: 'new-animal-id' },
        message: 'เพิ่มข้อมูลสัตว์เรียบร้อยแล้ว'
      }),
      ctx.status(201)
    );
  }),

  // Activities API
  rest.get('/api/activities', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [mockActivity]
      })
    );
  }),

  // Error simulation
  rest.post('/api/animals/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal Server Error'
      })
    );
  })
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## 📋 Manual Testing Procedures

### Mobile Testing Checklist

```markdown
## Mobile Testing Protocol

### ✅ Visual Testing (400px width)
- [ ] All pages render correctly at 400px width
- [ ] No horizontal scrolling occurs
- [ ] Text is readable without zooming
- [ ] Images scale appropriately
- [ ] Forms fit within viewport
- [ ] Buttons are touch-friendly (min 44px)

### ✅ Navigation Testing
- [ ] Tab navigation works with thumb
- [ ] Swipe gestures work smoothly
- [ ] Back button behavior correct
- [ ] Modal opening/closing smooth
- [ ] Form navigation logical

### ✅ Performance Testing
- [ ] Pages load within 3 seconds
- [ ] Form submissions provide feedback
- [ ] Loading states prevent confusion
- [ ] No lag in user interactions
- [ ] Images load progressively

### ✅ Functionality Testing
- [ ] All forms submit correctly
- [ ] Validation messages display clearly
- [ ] Toast notifications visible
- [ ] Data persistence works
- [ ] Error recovery possible
```

### Cross-Browser Testing

```markdown
## Browser Compatibility Testing

### ✅ Required Browsers
- [ ] Chrome Mobile (latest)
- [ ] Safari Mobile (latest)
- [ ] Firefox Mobile (latest)
- [ ] Samsung Internet (latest)

### ✅ Feature Testing
- [ ] localStorage works correctly
- [ ] Date inputs function properly
- [ ] File uploads work (future)
- [ ] Push notifications work (Round 8)
- [ ] Service workers function (Round 8)
```

## 🔗 Cross-Reference Links

### Related Documentation
- **ARCHITECTURE.md**: Component architecture สำหรับ understanding component structure
- **API-DESIGN.md**: API patterns สำหรับ API testing strategies
- **UI-GUIDELINES.md**: Component patterns สำหรับ visual testing guidelines
- **CLAUDE.md**: Round-specific prompts สำหรับ testing each development phase

### Key Testing Files
- **jest.config.js**: Test configuration และ coverage settings
- **jest.setup.js**: Global test setup และ mocks
- **mocks/**: API mocking สำหรับ isolated testing
- **test-helpers/**: Reusable testing utilities และ helpers

---

**Last Updated**: 2025-07-11 (Round 7.3 Documentation Enhancement)
**Next Review**: After Round 7.3 Activity Management Enhancement testing
**Usage**: สำหรับทุก Round ในการ ensure quality และ maintain testing standards throughout development