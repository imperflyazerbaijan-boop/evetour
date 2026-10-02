'use client'

import { savePlaceAction } from '../../content-actions'
import {
  Card,
  Field,
  I18nField,
  ListField,
  SubmitButton,
  TextArea,
  TextInput,
  ToggleField,
} from '../../_components/ui'
import { GalleryPicker, ImagePicker, SlugField } from '../../_components/fields'
import type { PlaceFormValues } from '../../_lib/mappers'

const empty: PlaceFormValues = {
  slug: '',
  titleEn: '',
  titleRu: '',
  summaryEn: '',
  summaryRu: '',
  descriptionEn: '',
  descriptionRu: '',
  image: '',
  images: [],
  highlights: [],
  coordinates: '',
  distanceKm: '',
  bestSeasonEn: '',
  bestSeasonRu: '',
  isPublished: true,
  sortOrder: '0',
}

export default function PlaceForm({
  values,
}: {
  values?: Partial<PlaceFormValues>
}) {
  const v = { ...empty, ...values }

  return (
    <form id="place-form" action={savePlaceAction} className="space-y-6">
      {v.id ? <input type="hidden" name="id" value={v.id} /> : null}

      <Card title="Basics">
        <div className="space-y-6">
          <I18nField label="Title" nameEn="titleEn" nameRu="titleRu" en={v.titleEn} ru={v.titleRu} />
          <SlugField formId="place-form" defaultValue={v.slug} />
          <I18nField
            label="Summary"
            nameEn="summaryEn"
            nameRu="summaryRu"
            en={v.summaryEn}
            ru={v.summaryRu}
          />
          <I18nField
            label="Description"
            nameEn="descriptionEn"
            nameRu="descriptionRu"
            en={v.descriptionEn}
            ru={v.descriptionRu}
            multiline
            rows={8}
          />
        </div>
      </Card>

      <Card title="Location">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Coordinates" hint="lat,lng — used for the map link.">
            <TextInput name="coordinates" defaultValue={v.coordinates} placeholder="41.1919, 47.1706" />
          </Field>
          <Field label="Distance from Baku (km)">
            <TextInput name="distanceKm" type="number" defaultValue={v.distanceKm} />
          </Field>
          <Field label="Sort order">
            <TextInput name="sortOrder" type="number" defaultValue={v.sortOrder} />
          </Field>
          <div className="sm:col-span-3">
            <I18nField
              label="Best season"
              nameEn="bestSeasonEn"
              nameRu="bestSeasonRu"
              en={v.bestSeasonEn}
              ru={v.bestSeasonRu}
            />
          </div>
          <div className="sm:col-span-3">
            <ToggleField name="isPublished" defaultChecked={v.isPublished} label="Published" />
          </div>
        </div>
      </Card>

      <Card title="Media">
        <div className="space-y-6">
          <ImagePicker name="image" defaultValue={v.image} label="Main image" />
          <GalleryPicker name="images" defaultValue={v.images} />
        </div>
      </Card>

      <Card title="Highlights" description="One item per line; lines pair up EN with RU.">
        <ListField
          label="Highlights"
          nameEn="highlightsEn"
          nameRu="highlightsRu"
          en={v.highlights.map((i) => i.en)}
          ru={v.highlights.map((i) => i.ru)}
        />
      </Card>

      <SubmitButton>{v.id ? 'Save changes' : 'Create place'}</SubmitButton>
    </form>
  )
}