import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const useAuth = () => {
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.User) {
            navigate('/');
        }
    }, [user, navigate]);

    return user;
};

export default useAuth;

