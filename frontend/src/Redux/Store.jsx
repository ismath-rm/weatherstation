import {configureStore} from '@reduxjs/toolkit'
import userBasicDetailsSliceReducer from './UserDetailsSlice'


export default configureStore({
    reducer:{
        user_basic_details:userBasicDetailsSliceReducer
    }
})