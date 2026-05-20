import api from '../api/axiosClient'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function getProfile() {
  try {
    const response = await api.get('/users/me')
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load profile.'))
  }
}

export async function updateProfile(profileData) {
  try {
    const response = await api.put('/users/me', profileData)
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update profile.'))
  }
}

export async function changePassword(passwordData) {
  try {
    const response = await api.post('/users/change-password', passwordData)
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to change password.'))
  }
}

export async function updateAddress(addressData) {
  try {
    const response = await api.put('/users/me/address', addressData)
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update address.'))
  }
}
