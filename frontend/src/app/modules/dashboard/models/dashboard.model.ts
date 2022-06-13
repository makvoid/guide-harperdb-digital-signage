import DeviceException from 'src/app/shared/device-exception'

interface DashboardInformation {
  widgets: {
    devices: {
      online: number
      total: number
    }
    recentAlerts: number
  }
  logs: DeviceException[]
}

export default DashboardInformation
