import { inject, Injectable, signal } from '@angular/core'
import { map } from 'rxjs'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { toSignal } from '@angular/core/rxjs-interop'
import { DrawerMenu } from '../../shared/interfaces/drawer-menu'
import { PrimeNG } from 'primeng/config'
import { FormGroup } from '@angular/forms'
import moment from 'moment'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { SelectOption } from '../../shared/interfaces/general'
import _ from 'lodash'
import { StorageService } from './storage.service'

@Injectable({
  providedIn: 'root',
})
export class UtilityService {

  private storage = inject(StorageService);
  private http = inject(HttpClient);
  private config = inject(PrimeNG);

  filterValues = signal<any>({})
  drawerVisible = signal<boolean>(false)
  groupVisible = signal<boolean>(false);
  categoryVisible = signal<boolean>(false);
  isDarkTheme = signal<boolean>(false)
  tableSkeletonRows = Array(5).fill({})

  icons = signal<SelectOption[]>([
    { label: 'Envelope', value: 'pi-envelope' },
    { label: 'Calendar', value: 'pi-calendar' },
    { label: 'Users', value: 'pi-users' },
    { label: 'Information', value: 'pi-info-circle' },
    { label: 'Announcement', value: 'pi-megaphone' },
    { label: 'Ban', value: 'pi-ban' },
    { label: 'Check', value: 'pi-check' },
    { label: 'Clock', value: 'pi-clock' },
    { label: 'Bell', value: 'pi-bell' },
    { label: 'Warning', value: 'pi-exclamation-triangle' },
  ])

  fileTypes = signal<SelectOption[]>([
    { label: 'Image', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Audio', value: 'audio' },
    { label: 'HTML', value: 'html' },
    { label: 'Link', value: 'link' },
    // { label: 'File', value: 'file' },
    // { label: 'Web', value: 'web' },
    // { label: 'Widget', value: 'widget' },
    // { label: 'Youtube', value: 'youtube' },
    // { label: 'Facebook', value: 'facebook' },
  ])

  orientations = signal<SelectOption[]>([
    { label: 'Landscape', value: 'landscape' },
    { label: 'Portrait', value: 'portrait' },
    { label: 'Square', value: 'square' },
  ])

  resolutions = signal<SelectOption[]>([
    { label: '1920x1080', value: '1920x1080' },
    { label: '1366x768', value: '1366x768' },
    { label: '1600x900', value: '1600x900' },
    { label: '2560x1440', value: '2560x1440' },
    { label: '3840x2160', value: '3840x2160' },
    { label: '1920x1200', value: '1920x1200' },
    { label: '1440x900', value: '1440x900' },
    { label: '1280x800', value: '1280x800' },
    { label: '1024x768', value: '1024x768' },
    { label: '800x600', value: '800x600' },
  ])

  modules = signal<DrawerMenu[]>([
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Screens', icon: 'pi pi-desktop', routerLink: '/screens/screen-registration' },
    { label: 'Assets', icon: 'pi pi-image', routerLink: '/assets/asset-library' },
    // { label: 'Layouts', icon: 'pi pi-palette', routerLink: '/layout/design-layout-library' },
    { label: 'Playlists', icon: 'pi pi-list', routerLink: '/playlist/playlist-library' },
    { label: 'Schedules', icon: 'pi pi-calendar', routerLink: '/schedule/schedule-library' },
    { label: 'Screen Mangement', icon: 'pi pi-cloud', routerLink: '/screen-management' },
    // { label: 'Reports', icon: 'pi pi-chart-bar', routerLink: '/reports' },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      expanded: false,
      items: [
        { label: 'Profile', icon: 'pi pi-user', routerLink: ['/settings/profile'] },
        { label: 'Users', icon: 'pi pi-users', routerLink: ['/settings/user-management'] },
        { label: 'Roles', icon: 'pi pi-lock', routerLink: ['/settings/role-management'] },
        { separator: true },
        { label: 'Broadcast', icon: 'pi pi-megaphone', routerLink: ['/settings/broadcast'] },
        { separator: true },
        { label: 'Groups', icon: 'pi pi-tag', routerLink: ['/settings/group'] },
        { label: 'Categories', icon: 'pi pi-tag', routerLink: ['/settings/category'] },
        { label: 'Tags', icon: 'pi pi-tag', routerLink: ['/settings/tag'] },
      ],
    },
  ])

  adminModules = signal<DrawerMenu[]>([
    { label: 'Summary', icon: 'pi pi-chart-line', routerLink: '/admin/summary' },
    { label: 'Screens', icon: 'pi pi-desktop', routerLink: '/admin/screens' },
    { label: 'Accounts', icon: 'pi pi-users', routerLink: '/admin/users' },
  ])

  status: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
  ]

  ageGroups = signal<any[]>([
    { id: 1, value: 'Child' },
    { id: 2, value: 'Teen' },
    { id: 3, value: 'Young Adult' },
    { id: 4, value: 'Adult' },
    { id: 5, value: 'Middle Age' },
    { id: 6, value: 'Senior' },
  ])

  genders = signal<any[]>([
    { id: 1, value: 'Male' },
    { id: 2, value: 'Female' },
  ])

  private breakPointObserver = inject(BreakpointObserver)
  readonly isMobile = toSignal(
    this.breakPointObserver
      .observe([Breakpoints.Handset])
      .pipe(map((result) => Object.values(result.breakpoints).some((match) => match))),
    { initialValue: false }
  )

  readonly isTablet = toSignal(
    this.breakPointObserver
      .observe([Breakpoints.Tablet])
      .pipe(map((result) => Object.values(result.breakpoints).some((match) => match))),
    { initialValue: false }
  )

  readonly isDesktop = toSignal(
    this.breakPointObserver
      .observe([Breakpoints.Web])
      .pipe(map((result) => Object.values(result.breakpoints).some((match) => match))),
    { initialValue: false }
  )

  roles: any[] = [
    { label: 'Administrator', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Guest', value: 'guest' },
  ]

  colors: any[] = [
    { text: 'blue', hex: '#36A2EB', rgb: '54, 162, 235' },
    { text: 'red', hex: '#FF6384', rgb: '255, 99, 132' },
    { text: 'green', hex: '#4BC0C0', rgb: '75, 192, 192' },
    { text: 'orange', hex: '#FF9F40', rgb: '255, 159, 64' },
    { text: 'violet', hex: '#9966FF', rgb: '153, 102, 255' },
    { text: 'yellow', hex: '#FFCD56', rgb: '255, 205, 86' },
    { text: 'indigo', hex: '#3F51B5', rgb: '63, 81, 181' },
    { text: 'salmon', hex: '#FA8072', rgb: '250, 128, 114' },
    { text: 'periwinkle', hex: '#CCCCFF', rgb: '204, 204, 255' },
    { text: 'pink', hex: '#FFC0CB', rgb: '255, 192, 203' },
    { text: 'orchid', hex: '#DA70D6', rgb: '218, 112, 214' },
    { text: 'taupe', hex: '#483D3C', rgb: '72, 61, 60' },
    { text: 'white', hex: '#ffffff', rgb: '255, 255, 255' },
    { text: 'black', hex: '#000000', rgb: '0, 0, 0' },
    { text: 'gray', hex: '#808080', rgb: '128, 128, 128' },
  ]

  platForms: any[] = [
    { label: 'Web', value: 'web' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Desktop', value: 'desktop' },
  ]

  fontOptions: string[] = [
    'Arial',
    'Britannic',
    'Calibri',
    'Cooper',
    'Courier New',
    'Comic Sans MS',
    'Elephant',
    'Franklin Gothic',
    'Georgia',
    'Impact',
    'Lucida Calligraphy',
    'Lucida Sans',
    'Segoe Print',
    'Times New Roman',
    'Verdana',
  ]

  isEmpty(value: any) {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      Object.keys(value).length === 0 ||
      !value
    )
  }

  setLightTheme() {
    const element: any = document.querySelector('html')
    element.classList.remove('dark')
    this.isDarkTheme.set(false)
  }

  setDarkTheme() {
    const element: any = document.querySelector('html')
    element.classList.toggle('dark')
    this.isDarkTheme.set(true)
  }

  /**
   * Generate an array of time slots for 24 hours, with each time slot
   * represented as an object with start and end properties.
   * The start and end times are in the format HH:MM:SS.
   * @returns The array of time slots.
   */
  generateTimeCode() {
    const timeSlots = []
    const interval = 15 // minutes

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        let endHour = hour
        let endMinute = minute + interval

        if (endMinute >= 60) {
          endMinute = 0
          endHour += 1
        }

        const end = `${endHour.toString().padStart(2, '0')}:${endMinute
          .toString()
          .padStart(2, '0')}`
        timeSlots.push({ start, end })
      }
    }

    return timeSlots
  }

  /**
   * Generates a random screen code of specified length.
   * The code consists of uppercase alphabets and numbers.
   *
   * @param length - The length of the screen code to generate.
   * @returns A string representing the generated screen code.
   */
  genereteScreenCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      code += characters.charAt(randomIndex)
    }
    return code
  }

  /**
   * Generates an array of time options in 30 minute increments.
   * The generated time options are in the format HH:MM.
   * @returns An array of strings representing the generated time options.
   */
  generateTimeOptions(): string[] {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(time)
      }
    }
    return times
  }

  constructor() {}

  formatDate(date: any, format: string, timeZone: string = 'Asia/Manila') {
    return moment(date).tz(timeZone)
  }

  formatSize(bytes: number, showSuffix: boolean = true) {
    const k = 1024
    const dm = 0
    const sizes: any = this.config.translation.fileSizeTypes
    if (bytes == 0) {
      return showSuffix ? `0 ${sizes[0]} ` : '0'
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const formattedSize = !isNaN(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)))
      ? parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
      : 0

    return showSuffix ? `${formattedSize} ${sizes[i]}` : `${formattedSize}`
  }

  timeConversion(ms: number, isReadable: boolean = false): string {
    const totalSeconds = Math.floor(ms)
    const hrs = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0')
    const mins = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')

    if (!isReadable) return `${hrs}:${mins}:${secs}`
    else
      return [
        hrs ? `${hrs}h` : '',
        mins ? `${mins}m` : '',
        secs || (!hrs && !mins) ? `${secs}s` : '',
      ]
        .filter(Boolean)
        .join(' ')
  }

  timeToSeconds(time: string) {
    if (!time) return
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return hours * 3600 + minutes * 60 + seconds
  }

  getFormControl(formGroup: FormGroup, fieldName: string) {
    return formGroup.controls[fieldName]
  }

  // getStatus(status: string) {
  //   const statuses = {
  //     approved: { status: 'success', icon: 'pi-thumbs-up-fill' },
  //     active: { status: 'success', icon: 'pi-check-circle' },
  //     online: { status: 'success', icon: 'pi-check-circle' },
  //     playing: { status: 'success', icon: 'pi-play-circle' },
  //     connected: { status: 'success', icon: 'pi-check-circle' },
  //     on: { status: 'success', icon: 'pi-check-circle' },
  //     success: { status: 'success', icon: 'pi-check-circle' },
  //     inactive: { status: 'warn', icon: 'pi-pause-circle' },
  //     standby: { status: 'warn', icon: 'pi-pause-circle' },
  //     expiring: { status: 'warn', icon: 'pi-pause-circle' },
  //     disapproved: { status: 'danger', icon: 'pi-thumbs-down-fill' },
  //     suspended: { status: 'danger', icon: 'pi-times-circle' },
  //     offline: { status: 'danger', icon: 'pi-times-circle' },
  //     disconnected: { status: 'danger', icon: 'pi-times-circle' },
  //     off: { status: 'danger', icon: 'pi-times-circle' },
  //     expired: { status: 'danger', icon: 'pi-times-circle' },
  //     error: { status: 'danger', icon: 'pi-times-circle' },
  //   }

  //   return statuses[status.toLowerCase()] || { status: 'secondary', icon: 'pi-question-circle' }
  // }

  getStatus(status: string) {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'active':
      case 'online':
      case 'playing':
      case 'connected':
      case 'on':
      case 'success':
        return 'success'
      case 'inactive':
      case 'standby':
      case 'expiring':
        return 'warn'
      case 'disapproved':
      case 'suspended':
      case 'offline':
      case 'disconnected':
      case 'off':
      case 'expired':
      case 'error':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  getIcon(status: string) {
    switch (status.toLowerCase()) {
      case 'playing':
        return 'pi-play-circle'
      case 'active':
      case 'online':
      case 'connected':
      case 'on':
      case 'success':
        return 'pi-check-circle'
      case 'inactive':
      case 'standby':
      case 'expiring':
        return 'pi-pause-circle'
      case 'disapproved':
        return 'pi-thumbs-down-fill'
      case 'approved':
        return 'pi-thumbs-up-fill'
      case 'suspended':
      case 'offline':
      case 'disconnected':
      case 'off':
      case 'expired':
      case 'error':
        return 'pi-times-circle'
      default:
        return 'pi-question-circle'
    }
  }

  toTitleCase(value: string) {
    return _.startCase(value)
  }

  onFilterItems(data: any[], filters: any) {
    const activeKeys = Object.keys(filters).filter((key) => filters[key]?.length)

    return data.filter((item) => {
      const tag = item.audienceTag

      return activeKeys.some((key) => {
        const filterValues = filters[key]
        const value = tag[key]

        if (Array.isArray(value)) {
          return value.some((v: any) => filterValues.includes(v))
        }

        return filterValues.includes(value)
      })
    })
  }
  onGetLastUpdatedLabel(dateInput: Date | string): string {
    const date = moment(dateInput)
    const now = moment()

    if (!dateInput || !moment(dateInput).isValid()) return '-'

    const diffSeconds = now.diff(date, 'seconds')
    const diffMinutes = now.diff(date, 'minutes')
    const diffHours = now.diff(date, 'hours')
    const diffDays = now.diff(date, 'days')
    const diffWeeks = now.diff(date, 'weeks')

    if (diffSeconds < 60) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`

    return date.format('MMM D, YYYY')
  }

  onGetEmbedUrl(url: string): any {
    if (url.includes('youtube') || url.includes('youtu.be')) {
      const videoId = this.extractYouTubeId(url);
      const link = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&controls=0&loop=0&fs=0&enablejsapi=1&disablekb=1&playsinline=1&showinfo=0`;
      return { link, videoId };
    }

    if (url.includes('facebook')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1&allowfullscreen=0`
    }

    if (url.includes('.html')) {
      return url
    }

    return ''
  }
  
  onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/no-image.png';
  }

  getLinkType(url: string): string {
    if (url.includes('facebook')) return 'facebook';
    if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
    return 'html';
  }

  private extractYouTubeId(url: string): string {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  onGETApi(url: string, isAdmin: boolean = false) {
    const tenantId = this.storage.get('id');
    const accessToken = `Bearer ${this.storage.get('accessToken')}`;

    const headers = new HttpHeaders({
      'x-tenant-id': tenantId,
      'Authorization': accessToken
    });

    const adminHeaders = new HttpHeaders({ 'Authorization': accessToken });

    return this.http.get(url, isAdmin ? { headers: adminHeaders } : { headers }); 
  }

  onPOSTApi(url: string, body: any) {
    const tenantId = this.storage.get('id');
    const accessToken = `Bearer ${this.storage.get('accessToken')}`;

    const headers = new HttpHeaders({
      'x-tenant-id': tenantId,
      'Authorization': accessToken
    });
    return this.http.post(url, body, { headers }); 
  }

  onPATCHApi(url: string, body: any) {
    const tenantId = this.storage.get('id');
    const accessToken = `Bearer ${this.storage.get('accessToken')}`;

    const headers = new HttpHeaders({
      'x-tenant-id': tenantId,
      'Authorization': accessToken
    });
    return this.http.patch(url, body, { headers }); 
  }

  onDELETEApi(url: string) {
    const tenantId = this.storage.get('id');
    const accessToken = `Bearer ${this.storage.get('accessToken')}`;

    const headers = new HttpHeaders({
      'x-tenant-id': tenantId,
      'Authorization': accessToken
    });
    return this.http.delete(url, { headers }); 
  }

  onMergeVirtualPage<T>(current: T[], page: number, limit: number, total: number, items: T[]): T[] {
    const data = [...current];
    if (data.length < total) data.length = total;
    const start = (page - 1) * limit;
    items.forEach((item, i) => data[start + i] = item);
    return data;
  }

  // Public API
  getPublicApi() {
    return this.http.get('https://ipapi.co/json/');
  }
  
  getWeatherData(lat: number, lng: number) {
    return this.http.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`
    )
  }

  getGeolocation(lat: number, lng: number) {
    return this.http.get(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
  }

  getReverseGeolocation(lat: number, lng: number) {
    return this.http.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&polygon_geojson=1&format=jsonv2&zoom=18`
    )
  }

  getAddressCoordinates(search: string) {
    return this.http.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
    )
  }
}
