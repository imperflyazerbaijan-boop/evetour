'use client'

import { saveSlideAction } from '../../content-actions'
import {
  Card,
  Field,
  I18nField,
  Select,
  SubmitButton,
  TextInput,
  ToggleField,
} from '../../_components/ui'
import { ImagePicker } from '../../_components/fields'
import type { SlideFormValues } from '../../_lib/mappers'

const empty: SlideFormValues = {
  titleEn: '',
  titleRu: '',
  subtitleEn: '',
  subtitleRu: '',
  ctaLabelEn: '',
  ctaLabelRu: '',
  image: '',
  ctaHref: '/tours',
  align: 'center',
  isPublished: true,
  sortOrder: '0',
}

export default function SlideForm({
  values,
}: {
  values?: Partial<SlideFormValues>
}) {
  const v = { ...empty, ...values }

  return (
    <form action={saveSlideAction} className="space-y-6">
      {v.id ? <input type="hidden" name="id" value={v.id} /> : null}

      <Card title="Slide content">
        <div className="space-y-6">
          <I18nField label="Title" nameEn="titleEn" nameRu="titleRu" en={v.titleEn} ru={v.titleRu} />
          <I18nField
            label="Subtitle"
            nameEn="subtitleEn"
            nameRu="subtitleRu"
            en={v.subtitleEn}
            ru={v.subtitleRu}
            multiline
          />
          <I18nField
            label="Button label"
            nameEn="ctaLabelEn"
            nameRu="ctaLabelRu"
            en={v.ctaLabelEn}
            ru={v.ctaLabelRu}
          />
        </div>
      </Card>

      <Card title="Layout">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Button link" hint="Locale-less path, e.g. /tours?cat=baku">
            <TextInput name="ctaHref" defaultValue={v.ctaHref} />
          </Field>
          <Field label="Text alignment">
            <Select name="align" defaultValue={v.align}>
              <option value="center">Centre</option>
              <option value="left">Left</option>
            </Select>
          </Field>
          <Field label="Sort order" hint="Lower numbers are shown first.">
            <TextInput name="sortOrder" type="number" defaultValue={v.sortOrder} />
          </Field>
          <div className="flex items-end">
            <ToggleField name="isPublished" defaultChecked={v.isPublished} label="Published" />
          </div>
        </div>
      </Card>

      <Card title="Background image">
        <ImagePicker name="image" defaultValue={v.image} label="Background" />
      </Card>

      <SubmitButton>{v.id ? 'Save changes' : 'Create slide'}</SubmitButton>
    </form>
  )
}