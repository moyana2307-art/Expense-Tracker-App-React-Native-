import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

it('renders the app without crashing', async () => {
  await render(<App />);
});