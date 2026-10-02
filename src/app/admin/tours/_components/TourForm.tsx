'use client'

import { saveTourAction } from '../../content-actions'
import { TOUR_CATEGORIES } from '@/lib/site'
import {
  Card,
  Field,
  I18nField,
  ListField,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
  ToggleField,
} from '../../_components/ui'
import { GalleryPicker, ImagePicker, SlugField } from '../../_components/fields'
import ItineraryEditor, { type ItineraryRow } from '../../_components/ItineraryEditor'

export type TourFormValues = {
  id?: string
  slug: string
  titleEn: string
  titleRu: string
  subtitleEn: string
  subtitleRu: string
  excerptEn: string
  excerptRu: string
  descriptionEn: string
  descriptionRu: string
  highlights: { en: string; ru: string }[]
  includes: { en: string; ru: string }[]
  excludes: { en: string; ru: string }[]
  itinerary: ItineraryRow[]
  category: string
  region: string
  duration: string
  priceFrom: string
  priceMode: string
  durationDays: string
  coverImage: string
  images: string[]
  isFeatured: boolean
  isPublished: boolean
  sortOrder: string
}

const empty: TourFormValues = {
  slug: '',
  titleEn: '',
  titleRu: '',
  subtitleEn: '',
  subtitleRu: '',
  excerptEn: '',
  excerptRu: '',
  descriptionEn: '',
  descriptionRu: '',
  highlights: [],
  includes: [],
  excludes: [],
  itinerary: [],
  category: 'packages',
  region: '',
  duration: '',
  priceFrom: '',
  priceMode: 'from',
  durationDays: '',
  coverImage: '',
  images: [],
  isFeatured: false,
  isPublished: true,
  sortOrder: '0',
}

export default function TourForm({ values }: { values?: Partial<TourFormValues> }) {
  const v = { ...empty, ...values }

  return (
    <form id="tour-form" action={saveTourAction} className="space-y-6">
      {v.id ? <input type="hidden" name="id" value={v.id} /> : null}

      <Card title="Basics" description="Shown in listings and at the top of the page.">
        <div className="space-y-6">
          <I18nField
            label="Title"
            nameEn="titleEn"
            nameRu="titleRu"
            en={v.titleEn}
            ru={v.titleRu}
          />

          <SlugField defaultValue={v.slug} />

          <I18nField
            label="Subtitle"
            nameEn="subtitleEn"
            nameRu="subtitleRu"
            en={v.subtitleEn}
            ru={v.subtitleRu}
            multiline
          />

          <I18nField
            label="Short excerpt"
            hint="One or two sentences used on cards and in search results."
            nameEn="excerptEn"
            nameRu="excerptRu"
            en={v.excerptEn}
            ru={v.excerptRu}
            multiline
          />

          <I18nField
            label="Full description"
            nameEn="descriptionEn"
            nameRu="descriptionRu"
            en={v.descriptionEn}
            ru={v.descriptionRu}
            multiline
            rows={8}
          />
        </div>
      </Card>

      <Card title="Practical details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <Select name="category" defaultValue={v.category}>
              {TOUR_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.key}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Region" hint="e.g. Absheron Peninsula">
            <TextInput name="region" defaultValue={v.region} />
          </Field>

          <Field label="Duration label" hint="e.g. 1 day, 2 days / 1 night">
            <TextInput name="duration" defaultValue={v.duration} />
          </Field>

          <Field label="Duration in days" hint="Used for sorting. Optional.">
            <TextInput name="durationDays" type="number" defaultValue={v.durationDays} />
          </Field>

          <Field label="Price from (EUR)" hint="Leave empty when the price is on request.">
            <TextInput name="priceFrom" type="number" defaultValue={v.priceFrom} />
          </Field>

          <Field label="Price display">
            <Select name="priceMode" defaultValue={v.priceMode}>
              <option value="from">Show “from €…”</option>
              <option value="request">On request</option>
            </Select>
          </Field>

          <Field label="Sort order" hint="Lower numbers appear first.">
            <TextInput name="sortOrder" type="number" defaultValue={v.sortOrder} />
          </Field>

          <div className="flex flex-col justify-end gap-4 sm:pb-1">
            <ToggleField name="isPublished" defaultChecked={v.isPublished} label="Published" />
            <ToggleField name="isFeatured" defaultChecked={v.isFeatured} label="Featured on the home page" />
          </div>
        </div>
      </Card>

      <Card title="Media">
        <div className="space-y-6">
          <ImagePicker name="coverImage" defaultValue={v.coverImage} label="Cover image" />

          <GalleryPicker name="images" defaultValue={v.images} />
        </div>
      </Card>

      <Card title="Content lists" description="One item per line; lines pair up EN with RU.">
        <div className="space-y-6">
          <ListField
            label="Highlights"
            nameEn="highlightsEn"
            nameRu="highlightsRu"
            en={v.highlights.map((i) => i.en)}
            ru={v.highlights.map((i) => i.ru)}
          />
          <ListField
            label="What's included"
            nameEn="includesEn"
            nameRu="includesRu"
            en={v.includes.map((i) => i.en)}
            ru={v.includes.map((i) => i.ru)}
          />
          <ListField
            label="What's excluded"
            nameEn="excludesEn"
            nameRu="excludesRu"
            en={v.excludes.map((i) => i.en)}
            ru={v.excludes.map((i) => i.ru)}
          />
        </div>
      </Card>

      <ItineraryEditor rows={v.itinerary} />

      <div className="flex flex-wrap gap-3">
        <SubmitButton>{v.id ? 'Save changes' : 'Create tour'}</SubmitButton>
      </div>
    </form>
  )
}