import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { createContext } from 'react';

const AxiosContext = createContext<AxiosInstance>(axios);

export default AxiosContext;
