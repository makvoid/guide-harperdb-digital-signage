import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'
import { firstValueFrom, Subscription } from 'rxjs'
import { faPlus, faMinus, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import { saveAs } from 'file-saver'

import Logger from 'src/app/shared/logger'
import { environment } from 'src/environments/environment'
import { DeviceStoreService } from '../../device-store.service'
import {
  TaskType,
  TaskTypeReadable,
  TaskOption,
  MetadataUrl,
  Device,
  deviceEditFormSchema,
  WebSeriesDynamicField
} from '../../models/device.model'
import { DeviceService } from '../../device.service'
import { ModalComponent } from 'src/app/modules/shared/modal/modal.component'

@Component({
  selector: 'app-device-detail',
  templateUrl: './device-detail.component.html'
})
export class DeviceDetailComponent implements OnInit, OnDestroy {
  // Subscriptions set up for the component
  subscriptions: Subscription[] = []
  // Task type options for populating the form
  taskOptions: TaskOption[] = []
  // Reference to TaskType for use within the template
  taskTypes = TaskType
  // Device ID currently being edited if applicable
  deviceId: string | null = null
  // Used for opening modals
  @ViewChild('modal', { static: false }) modalChild!: ModalComponent

  // Icons for the template to use
  icons = {
    add: faPlus,
    remove: faMinus,
    help: faQuestionCircle
  }

  // Edit Form
  editForm = this.formBuilder.group(deviceEditFormSchema)

  // Credentials Modal Form (for downloading the configuration)
  credentialsForm = this.formBuilder.group({
    username: [null, [Validators.required]],
    password: [null, [Validators.required]]
  })

  constructor (
    private title: Title,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    public deviceStore: DeviceStoreService,
    private deviceService: DeviceService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  /**
   * Removes the current device being viewed via the service
   *
   * @returns Promise<void>
   */
  async removeDevice () {
    if (!confirm(`Are you sure you want to remove the device ${this.editForm.value.name}?`)) {
      return
    }
    // Send removal request
    try {
      await firstValueFrom(this.deviceService.removeDevice(this.deviceId!))
    } catch (e) {
      Logger.error(e, 'Unable to remove device')
      this.toastr.error('Unable to remove device changes', 'Removal Error')
      return
    }
    this.toastr.success('Successfully removed device', 'Removal Success')

    // Navigate back to the list page and reload the state
    this.editForm.reset()
    this.router.navigate(['devices'])
    this.deviceStore.fetchAll()
  }

  /**
   * Download the active Device's configuration file
   */
  downloadConfig () {
    // Ensure a valid form has been submitted
    if (!this.credentialsForm.valid) {
      this.toastr.error(
        'Cannot download configuration due to a missing value', 'Download Error'
      )
      // If the field is untouched & invalid, mark it as dirty
      // so that it is visible to the User
      this.markFormAsDirty(this.editForm)
      return
    }
    // Close the credentials modal and grab the form values provided
    this.modalChild.close()
    const form = this.credentialsForm.value

    // Create configuration object
    const config = {
      id: this.deviceId,
      apiUrl: environment.apiUrl,
      authToken: btoa(`${form.username}:${form.password}`)
    }

    // Create a blob to hold the data and force a download
    const blob = new Blob(
      [JSON.stringify(config)],
      { type: 'application/json' }
    )
    saveAs(blob, 'sign_config.json')
    this.credentialsForm.reset()
  }

  /**
   * Marks a form's controls as dirty regardless of history
   *
   * @param form FormGroup form of interest
   */
  markFormAsDirty (form: FormGroup) {
    Object.keys(form).forEach(field => {
      const control = form.get(field)
      if (!control?.valid && !control?.dirty) {
        control?.markAsDirty()
      }
    })
  }

  /**
   * Save device information / assigned sign
   *
   * @returns Promise<void>
   */
  async saveDevice () {
    if (!this.editForm.valid) {
      this.toastr.error(
        'Cannot save the new settings due to a missing value', 'Save Error'
      )
      // If the field is untouched & invalid, mark it as dirty
      // so that it is visible to the User
      this.markFormAsDirty(this.editForm)
      return
    }

    // Create base device object before adding metadata
    const form = this.editForm.value
    const editedDevice: Device = {
      name: form.name,
      description: form.description,
      sign: {
        // Assign a unique ID so the user-interface
        // knows when the sign has changed state
        id: uuidv4(),
        type: form.signType,
        metadata: { }
      }
    }

    // Setup metadata based on form values/type
    switch (form.signType) {
      case TaskType.WebBasic:
        editedDevice.sign.metadata = {
          url: form.url,
          refreshTimer: form.refreshTimer
        }
        break
      case TaskType.WebSeries:
        // eslint-disable-next-line no-case-declarations
        const seriesUrls = this.getWebSeriesControlList()
          .map(control => ({
            url: form[`urls-${control.id}`],
            timer: form[`delays-${control.id}`]
          }))
        editedDevice.sign.metadata = {
          urls: seriesUrls
        }
        break
      case TaskType.YouTube:
        editedDevice.sign.metadata = {
          videoId: form.youtubeVideoId
        }
        break
      case TaskType.GoogleSlides:
        editedDevice.sign.metadata = {
          url: form.slidesUrl,
          slideTimer: form.slideTimer,
          loopType: form.loopType
        }
        break
    }

    // Send Update/Create request
    if (this.deviceId === 'new') {
      // Send creation request
      let response
      try {
        response = await firstValueFrom(this.deviceService.createDevice(editedDevice))
      } catch (e) {
        Logger.error(e, 'Unable to create device')
        this.toastr.error('Unable to create device', 'Save Error')
        return
      }
      this.toastr.success('Successfully created Device', 'Save Success')

      // Force a navigation event to the new device
      const newDeviceId = response.inserted_hashes[0]
      this.router.navigateByUrl('/', { skipLocationChange: true })
        .then(() => this.router.navigate(['devices', newDeviceId]))
    } else {
      // Send update request
      try {
        await firstValueFrom(this.deviceService.saveDevice(this.deviceId!, editedDevice))
      } catch (e) {
        Logger.error(e, 'Unable to save device')
        this.toastr.error('Unable to save device changes', 'Save Error')
        return
      }
      this.toastr.success('Successfully saved Device changes', 'Save Success')
    }

    // Update devices state in case the User navigates back before the timer fires
    this.deviceStore.fetchAll()
  }

  /**
   * Remove a specific web series control pair
   *
   * @param controlId number dynamic ID of the control to remove
   */
  removeWebSeriesControl (controlId: number) {
    this.editForm.removeControl(`urls-${controlId}`)
    this.editForm.removeControl(`delays-${controlId}`)
  }

  /**
   * Add a new Web Series URL control pair
   *
   * @returns number dynamic ID of new control added
   */
  addWebSeriesControl () {
    // Get a list of the dynamic fields IDs
    const controlNumbers = this.getWebSeriesControlList()
      .map(control => parseInt(control.name.replace('urls-', '')))

    // If this is the first dynamic field, use ID 2 - else grab the highest value
    // and add one to the value to get the next available ID number
    const num = controlNumbers.length === 0 ? 2 : Math.max(...controlNumbers) + 1

    // Create the new controls in the FormGroup
    this.editForm.addControl(`urls-${num}`, new FormControl(null, Validators.required))
    this.editForm.addControl(`delays-${num}`, new FormControl(null, Validators.required))

    return num
  }

  /**
   * For Angular to track which control is which, this is required
   * since our inputs are dynamically generated
   *
   * @param i number index of item
   * @param _items any items being iterated through
   * @returns number index of item actively being edited
   */
  webSeriesControlTrackHandler (i: number, _items: any) {
    return i
  }

  /**
   * Return a list of the Web Series controls
   *
   * @returns WebSeriesDynamicField[]
   */
  getWebSeriesControlList (): WebSeriesDynamicField[] {
    // Filter out any non-dynamic fields
    return Object.keys(this.editForm.value)
      .filter(control => control.includes('urls-'))
      .map(controlName => ({
        id: parseInt(controlName.replace('urls-', '')),
        name: controlName,
        control: this.editForm.get(controlName)!
      }))
  }

  /**
   * Reset task type validators and reset validity
   */
  resetValidatorsAndValidity () {
    // Reset old required validator state
    const staticControls = ['url', 'youtubeVideoId', 'slidesUrl', 'slideTimer', 'loopType']
    staticControls.forEach(fieldName => this.editForm.get(fieldName)?.removeValidators(Validators.required))

    // Web (Series)
    this.getWebSeriesControlList()
      .forEach(control => {
        this.editForm.get(control.name)?.removeValidators(Validators.required)
        this.editForm.get(`delays-${control.id}`)?.removeValidators(Validators.required)
      })

    // Reset any validity flags
    Object.keys(this.editForm.value).forEach(field => {
      this.editForm.get(field)?.updateValueAndValidity()
    })
  }

  /**
   * Handle certain actions once the task type has been switched
   *
   * @returns void
   */
  handleTaskTypeChange () {
    const signType = this.editForm.get('signType')
    if (!signType) return

    // Reset validators/validity
    this.resetValidatorsAndValidity()

    // Setup validators based on task type
    switch (signType.value) {
      case TaskType.WebBasic:
        this.editForm.get('url')?.addValidators(Validators.required)
        break
      case TaskType.WebSeries:
        // Remove the old controls
        this.getWebSeriesControlList()
          .forEach(control => this.editForm.removeControl(control.name))
        // Setup the fields if applicable
        if (this.deviceStore.device?.sign.metadata['urls']) {
          this.deviceStore.device?.sign.metadata['urls'].forEach((url: MetadataUrl) => {
            const controlId = this.addWebSeriesControl()
            this.editForm.controls[`urls-${controlId}`].setValue(url.url)
            this.editForm.controls[`delays-${controlId}`].setValue(url.timer)
          })
        } else {
          // At minimum, add at least one control
          this.addWebSeriesControl()
        }
        break
      case TaskType.YouTube:
        this.editForm.get('youtubeVideoId')?.addValidators(Validators.required)
        break
      case TaskType.GoogleSlides:
        this.editForm.get('slidesUrl')?.addValidators(Validators.required)
        this.editForm.get('slideTimer')?.addValidators(Validators.required)
        this.editForm.get('loopType')?.addValidators(Validators.required)
        break
    }
  }

  /**
   * Update formBuilder values from Device Store
   */
  updateForm () {
    const formControls = this.editForm.controls
    formControls['name'].setValue(this.deviceStore.device?.name)
    formControls['description'].setValue(this.deviceStore.device?.description)
    formControls['signType'].setValue(this.deviceStore.device?.sign.type)

    // Web Basic
    if (this.deviceStore.device?.sign.type === TaskType.WebBasic) {
      formControls['url'].setValue(this.deviceStore.device?.sign.metadata['url'])
    }
    // Web Series is handled within handleTaskTypeChange since it's dynamic
    // YouTube
    if (this.deviceStore.device?.sign.type === TaskType.YouTube) {
      this.editForm.get('youtubeVideoId')?.setValue(this.deviceStore.device?.sign.metadata['videoId'])
    }
    // Google Slides
    if (this.deviceStore.device?.sign.type === TaskType.GoogleSlides) {
      const metadata = this.deviceStore.device?.sign.metadata
      this.editForm.get('slidesUrl')?.setValue(metadata['url'])
      this.editForm.get('slideTimer')?.setValue(metadata['slideTimer'])
      this.editForm.get('loopType')?.setValue(metadata['loopType'])
    }

    // Trigger a task change event so our form is up to date
    this.handleTaskTypeChange()
  }

  /**
   * Checks if a control has been modified and is invalid
   *
   * @param controlName string name of control to check
   * @returns boolean
   */
  isControlInvalid (form: FormGroup, controlName: string) {
    const control = form.get(controlName)
    return control?.invalid &&
      control?.errors &&
      (control?.dirty || control?.touched)
  }

  ngOnDestroy () {
    // Whenever the component is destroyed, remove any subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  async ngOnInit () {
    // Set initial title, grab deviceId from paramMap
    this.title.setTitle('Device Detail' + environment.pageTag)
    this.deviceId = this.activatedRoute.snapshot.paramMap.get('deviceId')

    // Subscribe to any device changes to keep the form updated
    this.subscriptions.push(
      this.deviceStore.device$.subscribe(() => this.updateForm())
    )

    // Create an easy object to reference task types with in the markup
    for (const key in TaskType) {
      this.taskOptions.push({
        key,
        slug: TaskType[key as keyof typeof TaskType],
        readable: TaskTypeReadable[key as keyof typeof TaskTypeReadable]
      })
    }

    let deviceName
    if (this.deviceId !== 'new') {
      // Load device from deviceStore
      try {
        await this.deviceStore.fetch(this.deviceId!)
      } catch (e) {
        Logger.error(e, 'Unable to load device')
        this.toastr.error('Unable to load device information')
        return
      }
      deviceName = this.deviceStore.device?.name
    } else {
      deviceName = 'New'
      this.editForm.reset()
    }

    // Ensure a name was loaded (valid record)
    if (!deviceName) {
      this.router.navigate(['devices'])
    }

    // Update title with Device name
    this.title.setTitle(
      `Device Detail (${deviceName})` + environment.pageTag
    )
  }
}
