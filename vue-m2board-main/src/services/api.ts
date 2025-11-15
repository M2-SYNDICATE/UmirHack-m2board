// Типы для авторизации
export interface LoginCredentials {
  login: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user_id: number
  username: string
  email: string
}

export interface User {
  id: string
  email: string
  name: string
  username: string
  createdAt: string
}

// Типы для папок и проектов
export interface Project {
  id: number
  name: string
  status: string
  created_at: string
  updated_at: string | null
  product_description?: string
  // Добавляем поля из ScriptGenerationResponse
  result_path?: string
  image_path?: string
  image_description?: string
  user_id?: number
  folder_id?: number
}

export interface Folder {
  id: number
  name: string
  user_id: number
  archived: boolean
  created_at: string
  updated_at: string | null
  projects: Project[]
}

// Типы для создания папки и генерации скрипта
export interface CreateFolderData {
  name: string
}

export interface GenerateScriptData {
  project_name: string
  product_description: string
  folder_id?: number
}

export interface ScriptGenerationResponse {
  project_id: number
  user_id: number
  folder_id: number
  project_name: string
  status: string
  created_at: string
  updated_at: string
  result_path: string
  image_path: string
  image_description: string
}

export interface UpdateFolderData {
  name: string
  archived: boolean
}

// Добавляем тип для обновления проекта
export interface UpdateProjectData {
  name?: string
  status?: string
  product_description?: string
  result_path?: string
  image_path?: string
  image_description?: string
}

export interface Scenario {
  product_description: string
  original_blocks_count: number
  final_blocks_count: number
  blocks: ScenarioBlock[]
}

export interface ScenarioBlock {
  type: string
  content: any
  formatting: any
  index: number
  isNew?: boolean
  tempPosition?: number
}

export interface AddBlockResponse {
  added_block: ScenarioBlock
  scenario: Scenario
}

export interface UpdateBlockResponse {
  updated_block: ScenarioBlock
  scenario: Scenario
}

export interface DeleteBlockResponse {
  deleted_index: number
  scenario: Scenario
}

export interface ReorderBlocksData {
  new_order: number[]
}

export interface ReorderBlocksResponse {
  index_map: { [key: string]: number }
  scenario: Scenario
}

export interface BlockImage {
  image_id: string | null
  mime_type: string
  data_base64: string
}

export interface BlockImagesResponse {
  project_id: number
  results: Array<{
    block_index: number
    images: BlockImage[]
  }>
}

// Базовый API клиент
class ApiService {
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
  }

  private getAuthHeader(): { [key: string]: string } {
    const token = localStorage.getItem('m2boards_access_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    const authHeaders = this.getAuthHeader()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    }

    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      if (!response.ok) {
        // Если 401 Unauthorized, очищаем аутентификацию
        if (response.status === 401) {
          localStorage.removeItem('m2boards_access_token')
          localStorage.removeItem('m2boards_user')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
      throw new Error('Network error')
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        login: credentials.login,
        password: credentials.password,
      }),
    })

    console.log('Login response:', response)

    return response
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    })
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'GET',
    })
  }

  // Folders methods
  async getFolders(): Promise<Folder[]> {
    return this.request<Folder[]>('/folders', {
      method: 'GET',
    })
  }

  async createFolder(data: CreateFolderData): Promise<Folder> {
    return this.request<Folder>('/folders/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteFolder(folder_id: number): Promise<void> {
    return this.request<void>(`/folders/${folder_id}`, {
      method: 'DELETE',
    })
  }

  async updateFolder(folderId: number, data: UpdateFolderData): Promise<Folder> {
    return this.request<Folder>(`/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Projects methods
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects', {
      method: 'GET',
    })
  }

  async getProject(projectId: number): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'GET',
    })
  }

  async updateProject(projectId: number, data: UpdateProjectData): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(projectId: number): Promise<void> {
    return this.request<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  // Script generation methods
  async generateScript(data: GenerateScriptData): Promise<ScriptGenerationResponse> {
    return this.request<ScriptGenerationResponse>('/script-generator/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getScriptStatus(projectId: number): Promise<ScriptGenerationResponse> {
    return this.request<ScriptGenerationResponse>(`/script-generator/status/${projectId}`)
  }
  // Сценарий методы
  async getScenario(projectId: number): Promise<Scenario> {
    return this.request<Scenario>(`/script-generator/scenario/${projectId}`)
  }

  async updateScenario(projectId: number, data: Partial<Scenario>): Promise<Scenario> {
    return this.request<Scenario>(`/script-generator/scenario/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Блоки методы
  async addBlock(
    projectId: number,
    block: Omit<ScenarioBlock, 'index'>,
    position?: number,
  ): Promise<AddBlockResponse> {
    const params = position !== undefined ? { position } : {}
    const queryString = new URLSearchParams(params as any).toString()
    const url = `/script-generator/scenario/${projectId}/blocks${queryString ? `?${queryString}` : ''}`

    return this.request<AddBlockResponse>(url, {
      method: 'POST',
      body: JSON.stringify(block),
    })
  }

  async updateBlock(
    projectId: number,
    blockIndex: number,
    patch: Partial<ScenarioBlock>,
  ): Promise<UpdateBlockResponse> {
    return this.request<UpdateBlockResponse>(
      `/script-generator/scenario/${projectId}/blocks/${blockIndex}`,
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
      },
    )
  }

  async deleteBlock(projectId: number, blockIndex: number): Promise<DeleteBlockResponse> {
    return this.request<DeleteBlockResponse>(
      `/script-generator/scenario/${projectId}/blocks/${blockIndex}`,
      {
        method: 'DELETE',
      },
    )
  }

  async reorderBlocks(projectId: number, newOrder: number[]): Promise<ReorderBlocksResponse> {
    return this.request<ReorderBlocksResponse>(
      `/script-generator/scenario/${projectId}/blocks/reorder`,
      {
        method: 'POST',
        body: JSON.stringify({ new_order: newOrder }),
      },
    )
  }

  // Изображения методы (уже есть, но для полноты)
  async generateImageForBlock(data: { project_id: number; block_index: number }): Promise<any> {
    return this.request<any>('/script-generator/generate_image_for_block', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async editImageForBlock(data: {
    project_id: number
    block_index: number
    use_block_prompt: boolean
    custom_prompt: string
  }): Promise<any> {
    return this.request<any>('/script-generator/edit_image_for_block', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getBlockImages(projectId: number, blockIndices: number[]): Promise<BlockImagesResponse> {
    return this.request<BlockImagesResponse>(
      `/script-generator/scenario/${projectId}/blocks/images`,
      {
        method: 'POST',
        body: JSON.stringify({ block_indices: blockIndices }),
      },
    )
  }
}

export const apiService = new ApiService()
