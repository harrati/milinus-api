export type FacebookMeData = {
  id: string
  email: string
  first_name: string
  last_name: string
  picture: {
    data: {
      height: number
      url: string
      width: number
    }
  }
}

export type FacebookValidate = {
  data: {
    is_valid: boolean
    app_id: string
  }
}

export type FacebookTokenData = { access_token: string }
