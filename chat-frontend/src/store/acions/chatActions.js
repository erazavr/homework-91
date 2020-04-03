import axiosApi from "../../axiosApi";
export const FETCH_MESSAGE_SUCCESS = 'FETCH_MESSAGE_SUCCESS';
export const FETCH_MESSAGE_FAILURE = 'FETCH_MESSAGE_FAILURE';

export const fetchMessageSuccess = message => ({type: FETCH_MESSAGE_SUCCESS, message});
export const fetchMessageFailure = error => ({type: FETCH_MESSAGE_FAILURE, error});

export const newMessage = message => {
    return async dispatch => {
        try {
            await axiosApi.post('/messages', message);
            dispatch(fetchMessageSuccess())
        } catch (error) {
            dispatch(fetchMessageFailure(error))
        }
    }
};