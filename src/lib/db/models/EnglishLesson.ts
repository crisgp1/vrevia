import mongoose, { Schema, Document, Model } from "mongoose"

interface ContentSection {
  type: "text" | "video" | "audio" | "image" | "interactive"
  title: string
  content: string
  order: number
  audioUrl?: string // URL del audio generado con ElevenLabs
}

interface Resource {
  title: string
  type: "pdf" | "audio" | "video"
  url: string
}

export interface IEnglishLesson extends Document {
  _id: mongoose.Types.ObjectId
  lessonNumber: number
  level: "a1" | "a2" | "b1" | "b2" | "b2plus"
  title: string
  description: string
  grammar: string
  vocabulary: string
  content: {
    sections: ContentSection[]
  }
  resources?: Resource[]
  estimatedDuration: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const englishLessonSchema = new Schema<IEnglishLesson>(
  {
    lessonNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 150,
    },
    level: {
      type: String,
      enum: ["a1", "a2", "b1", "b2", "b2plus"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    grammar: {
      type: String,
      required: true,
    },
    vocabulary: {
      type: String,
      required: true,
    },
    content: {
      sections: [
        {
          type: {
            type: String,
            enum: ["text", "video", "audio", "image", "interactive"],
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
          order: {
            type: Number,
            required: true,
          },
          audioUrl: {
            type: String,
            required: false,
          },
        },
      ],
      default: { sections: [] },
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["pdf", "audio", "video"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    estimatedDuration: {
      type: Number,
      default: 60, // minutos
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const EnglishLesson: Model<IEnglishLesson> =
  mongoose.models.EnglishLesson ||
  mongoose.model<IEnglishLesson>("EnglishLesson", englishLessonSchema)

export default EnglishLesson
