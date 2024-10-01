import {createSlice} from '@reduxjs/toolkit'


export const userBasicDetailsSlice = createSlice(
   {
    name: 'user_basic_details',
    initialState: {
      id : null,
      name: null,
      email:null,
      is_superuser:false,
      is_authenticated:false,

      
    },
    reducers: {
      set_user_basic_details: (state, action) => {
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.is_superuser = action.payload.is_superuser; 
        state.is_authenticated = action.payload.is_authenticated; 

      }
    }


})

export const {set_user_basic_details} =  userBasicDetailsSlice.actions

export default userBasicDetailsSlice.reducer