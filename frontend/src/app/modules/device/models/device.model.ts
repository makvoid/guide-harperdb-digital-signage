/* eslint-disable no-unused-vars */
import { AbstractControl, Validators } from '@angular/forms'
import { HarperDBRecord } from 'src/app/shared/harperdb'

export interface DeviceSign {
  id: string
  type: string
  metadata: { [key: string]: any }
}

export interface Device extends HarperDBRecord {
  id?: string
  name: string
  description: string
  sign: DeviceSign
  createdTime?: Date
}

export enum TaskType {
  WebBasic = 'web-basic',
  WebSeries = 'web-series',
  YouTube = 'youtube',
  GoogleSlides = 'google-slides'
}

export enum TaskTypeReadable {
  WebBasic = 'Web (Basic)',
  WebSeries = 'Web (Series)',
  YouTube = 'YouTube',
  GoogleSlides = 'Google Slides'
}

export interface TaskOption {
  key: string
  slug: string
  readable: string
}

export interface MetadataUrl {
  url: string
  timer: number
}

export interface WebSeriesDynamicField {
  id: number
  name: string
  control: AbstractControl
}

export const deviceEditFormSchema = {
  // Base attributes
  name: [null, [Validators.required, Validators.minLength(3)]],
  description: [null],
  signType: [null, [Validators.required]],
  // Web (Basic)
  url: [null],
  refreshTimer: [null],
  // YouTube
  youtubeVideoId: [null],
  // Google Slides
  slidesUrl: [null],
  slideTimer: [null],
  loopType: [null]
}
