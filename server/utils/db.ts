import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'server', 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export const getCollection = <T>(collectionName: string): T[] => {
  const filePath = path.join(dataDir, `${collectionName}.json`)
  if (!fs.existsSync(filePath)) {
    return []
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data) as T[]
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error)
    return []
  }
}

export const saveCollection = <T>(collectionName: string, data: T[]): void => {
  const filePath = path.join(dataDir, `${collectionName}.json`)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error saving collection ${collectionName}:`, error)
  }
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
