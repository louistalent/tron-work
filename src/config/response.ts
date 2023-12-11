import { Result } from "../types/response.types"

// success
export const signInSuccess: Result = {
    code: 1001, 
    message: "Sign in successfully 🎉"
}
export const tokenRecreate: Result = {
    code: 1002,
    message: "Token Recreate"
}
export const signOutSuccess: Result = {
    code: 1003,
    message: "Sign out successfully🎉"
}
export const createMemberSuccess: Result = {
    code: 1004,
    message: 'Create Member successfully🎉'
}
export const updateMemberSuccess: Result = {
    code: 1005,
    message: 'Update Member successfully🎉'
}

export const deleteMemberSuccess: Result = {
    code: 1006,
    message: 'Delete Member successfully🎉'
}

export const changePasswordSuccess: Result = {
    code: 1011,
    message: 'Change Password successfully🎉'
}

export const createPostSuccess: Result = {
    code: 1004,
    message: 'Create Post successfully🎉'
}
export const updatePostSuccess: Result = {
    code: 1005,
    message: 'Update Post successfully🎉'
}

export const deletePostSuccess: Result = {
    code: 1006,
    message: 'Delete Post successfully🎉'
}
// Duplicate //
export const emailDuplicateError: Result = {
    code: 2001,
    message: "The email is a duplicate."
}

export const nicknameDuplicateError: Result = {
    code: 2002,
    message: "The nickname is a duplicate."
}

// invalid //
export const headersValidationError: Result = {
    code: 3001,
    message: "Invalid header information. "
}

export const idValiodationError: Result ={
    code: 3002,
    message: "This ID is not available."
}

export const nicknameValiodationError: Result ={
    code: 3003,
    message: "This is an invalid nickname."
}

export const memberValidationError: Result = {
    code: 3004,
    message: "The id or password is incorrect."
}

export const passwordIncorrectError: Result = {
    code: 3011,
    message: 'Old Password is incorrect.'
}

// failed
export const tokenVerificationFailed: Result = {
    code: 4001,
    message: "The token has expired."
}

export const notFoundApiKey: Result = {
    code: 4002,
    message: "Not found API KEY"
}