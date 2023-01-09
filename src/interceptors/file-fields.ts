export interface IField {
  name: string
  folder: uploadFolders
  allowedTypes: Array<string>
}

type uploadFolders = 'image' | 'video'

export const fileFields: Array<IField> = [
  {
    name: 'pictureUrl',
    folder: 'image',
    allowedTypes: ['image/jpeg', 'image/png'],
  },
  { name: 'gifUrl', folder: 'image', allowedTypes: ['image/gif'] },
  { name: 'videoUrl', folder: 'video', allowedTypes: ['video/mp4'] },
]
