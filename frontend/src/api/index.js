import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error.response?.data || { message: '网络错误' })
  }
)

export const monkeyApi = {
  list: () => api.get('/monkeys'),
  listAvailable: () => api.get('/monkeys/available'),
  getById: (id) => api.get(`/monkeys/${id}`)
}

export const tierApi = {
  list: () => api.get('/tiers'),
  getById: (id) => api.get(`/tiers/${id}`)
}

export const orderApi = {
  create: (data) => api.post('/orders', data),
  getByOrderNo: (orderNo) => api.get(`/orders/${orderNo}`)
}

export const paymentApi = {
  simulate: (orderNo) => api.post(`/payment/simulate/${orderNo}`),
  callback: (data) => api.post('/payment/callback', data),
  getByPaymentNo: (paymentNo) => api.get(`/payment/${paymentNo}`)
}

export const certificateApi = {
  getByNo: (certNo) => api.get(`/certificates/${certNo}`),
  download: (certNo) => `/api/certificates/${certNo}/download`,
  view: (certNo) => `/api/certificates/${certNo}/view`
}

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
}

export const diaryApi = {
  getByMonkeyId: (monkeyId) => api.get(`/monkeys/${monkeyId}/diaries`),
  getLatest: (limit = 5) => api.get(`/diaries/latest?limit=${limit}`)
}

export default api
