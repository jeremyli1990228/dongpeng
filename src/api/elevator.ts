export interface ElevatorDevice {
  id: number
  name: string
  location: string
  mode: 'auto' | 'controlled'
  status: 'online' | 'offline' | 'fault'
  currentFloor: number | null
  totalFloors: number
  lastUpdate: string
}

export interface ElevatorRecord {
  id: number
  elevatorId: number
  elevatorName: string
  personName: string
  cardNumber: string
  sourceFloor: number
  targetFloor: number
  accessTime: string
  accessType: 'card' | 'remote' | 'app'
  result: 'success' | 'denied'
}

export interface CallElevatorRequest {
  elevatorId: number
  targetFloor: number
  callType: 'up' | 'down'
}

class ElevatorApi {
  private baseUrl = '/api/elevator'

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error('API request failed')
    }
    
    return response.json()
  }

  async getDevices(locationId?: number): Promise<ElevatorDevice[]> {
    const mockDevices: ElevatorDevice[] = [
      { id: 1, name: '1号电梯', location: '东鹏大厦1号正门', mode: 'auto', status: 'online', currentFloor: 5, totalFloors: 10, lastUpdate: new Date().toISOString() },
      { id: 2, name: '2号电梯', location: '东鹏大厦1号正门', mode: 'controlled', status: 'online', currentFloor: 3, totalFloors: 10, lastUpdate: new Date().toISOString() },
      { id: 3, name: '3号电梯', location: '东鹏大厦1号正门', mode: 'auto', status: 'fault', currentFloor: 7, totalFloors: 10, lastUpdate: new Date().toISOString() },
      { id: 4, name: '4号电梯', location: '东鹏大厦1号正门', mode: 'controlled', status: 'offline', currentFloor: null, totalFloors: 10, lastUpdate: new Date().toISOString() },
    ]

    return new Promise(resolve => setTimeout(() => resolve(mockDevices), 300))
  }

  async setMode(elevatorId: number, mode: 'auto' | 'controlled'): Promise<{ success: boolean; message: string }> {
    return new Promise(resolve => setTimeout(() => {
      resolve({ success: true, message: `电梯${elevatorId}已切换为${mode === 'auto' ? '自动' : '受控'}模式` })
    }, 500))
  }

  async callElevator(request: CallElevatorRequest): Promise<{ success: boolean; message: string }> {
    return new Promise(resolve => setTimeout(() => {
      resolve({ success: true, message: `已成功呼叫电梯前往${request.targetFloor}楼` })
    }, 800))
  }

  async getRecords(elevatorId?: number, startTime?: string, endTime?: string): Promise<ElevatorRecord[]> {
    const mockRecords: ElevatorRecord[] = [
      { id: 1, elevatorId: 2, elevatorName: '2号电梯', personName: '魏国伟', cardNumber: 'CN2024001', sourceFloor: 1, targetFloor: 5, accessTime: '2024-01-15 09:30:25', accessType: 'card', result: 'success' },
      { id: 2, elevatorId: 2, elevatorName: '2号电梯', personName: '张三', cardNumber: 'CN2024002', sourceFloor: 1, targetFloor: 3, accessTime: '2024-01-15 09:32:18', accessType: 'app', result: 'success' },
      { id: 3, elevatorId: 2, elevatorName: '2号电梯', personName: '李四', cardNumber: 'CN2024003', sourceFloor: 5, targetFloor: 8, accessTime: '2024-01-15 09:35:42', accessType: 'card', result: 'denied' },
      { id: 4, elevatorId: 2, elevatorName: '2号电梯', personName: '王五', cardNumber: 'CN2024004', sourceFloor: 1, targetFloor: 10, accessTime: '2024-01-15 09:40:12', accessType: 'remote', result: 'success' },
      { id: 5, elevatorId: 1, elevatorName: '1号电梯', personName: '赵六', cardNumber: 'CN2024005', sourceFloor: 2, targetFloor: 6, accessTime: '2024-01-15 09:45:33', accessType: 'card', result: 'success' },
    ]

    return new Promise(resolve => setTimeout(() => resolve(mockRecords), 300))
  }

  async getRealtimeStatus(elevatorId: number): Promise<ElevatorDevice> {
    const mockStatus: ElevatorDevice = {
      id: elevatorId,
      name: `${elevatorId}号电梯`,
      location: '东鹏大厦1号正门',
      mode: Math.random() > 0.5 ? 'auto' : 'controlled',
      status: Math.random() > 0.2 ? 'online' : Math.random() > 0.5 ? 'offline' : 'fault',
      currentFloor: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null,
      totalFloors: 10,
      lastUpdate: new Date().toISOString(),
    }

    return new Promise(resolve => setTimeout(() => resolve(mockStatus), 200))
  }
}

export const elevatorApi = new ElevatorApi()
