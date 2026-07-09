import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../src/App';

const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = String(value); }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i) => Object.keys(store)[i] ?? null),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function setup() {
  const user = userEvent.setup();
  const result = render(<App />);
  return { user, ...result };
}

async function createActivity(user, title = 'Lezione di yoga') {
  const addBtn = screen.getByRole('button', { name: /nuova attività/i });
  await user.click(addBtn);
  const dialog = screen.getByRole('dialog');
  const titleInput = within(dialog).getByLabelText('Titolo');
  await user.clear(titleInput);
  await user.type(titleInput, title);
  const saveBtn = within(dialog).getByRole('button', { name: /crea attività/i });
  await user.click(saveBtn);
}

describe('SettimanaPiano', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('1. Renders the app shell correctly', () => {
    render(<App />);
    expect(screen.getByText('Settimana')).toBeInTheDocument();
    expect(screen.getByText('Piano')).toBeInTheDocument();
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText(/SettimanaPiano/)).toBeInTheDocument();
  });

  it('2. Can open the add-activity dialog via header button', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /nuova attività/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Titolo')).toBeInTheDocument();
  });

  it('3. Can create a new activity and see it on the grid', async () => {
    const { user } = setup();
    await createActivity(user, 'Lezione di yoga');
    await waitFor(() => {
      expect(screen.getByText('Lezione di yoga')).toBeInTheDocument();
    });
  });

  it('4. Created activity is persisted in localStorage', async () => {
    const { user } = setup();
    await createActivity(user, 'Riunione team');
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    const lastCall = localStorageMock.setItem.mock.calls.at(-1);
    const saved = JSON.parse(lastCall[1]);
    expect(saved.some((a) => a.title === 'Riunione team')).toBe(true);
  });

  it('5. Can open editor on an activity block via keyboard', async () => {
    const { user } = setup();
    await createActivity(user, 'Studio pomeridiano');

    await waitFor(() => {
      expect(screen.getByText('Studio pomeridiano')).toBeInTheDocument();
    });

    const block = screen.getByRole('button', { name: /Studio pomeridiano/ });
    block.focus();
    fireEvent.keyDown(block, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('6. Can delete an activity', async () => {
    const { user } = setup();
    await createActivity(user, 'Da eliminare');

    await waitFor(() => {
      expect(screen.getByText('Da eliminare')).toBeInTheDocument();
    });

    const block = screen.getByRole('button', { name: /Da eliminare/ });
    block.focus();
    fireEvent.keyDown(block, { key: 'Enter', code: 'Enter', charCode: 13 });

    const dialog = await screen.findByRole('dialog');
    const deleteBtn = within(dialog).getByRole('button', { name: /elimina/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Da eliminare')).not.toBeInTheDocument();
    });
  });

  it('7. Can edit an existing activity', async () => {
    const { user } = setup();
    await createActivity(user, 'Corso di pittura');

    await waitFor(() => {
      expect(screen.getByText('Corso di pittura')).toBeInTheDocument();
    });

    const block = screen.getByRole('button', { name: /Corso di pittura/ });
    block.focus();
    fireEvent.keyDown(block, { key: 'Enter', code: 'Enter', charCode: 13 });

    const dialog = await screen.findByRole('dialog');
    const titleInput = within(dialog).getByLabelText('Titolo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Corso di scultura');
    const saveBtn = within(dialog).getByRole('button', { name: /salva modifiche/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Corso di scultura')).toBeInTheDocument();
      expect(screen.queryByText('Corso di pittura')).not.toBeInTheDocument();
    });
  });

  it('8. Validation: title is required', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /nuova attività/i }));
    const dialog = screen.getByRole('dialog');
    const titleInput = within(dialog).getByLabelText('Titolo');
    await user.clear(titleInput);
    await user.click(within(dialog).getByRole('button', { name: /crea attività/i }));
    expect(within(dialog).getByText(/inserisci un titolo/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('9. Escape key closes the editor', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /nuova attività/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('10. Week navigation buttons exist', () => {
    render(<App />);
    expect(screen.getByLabelText('Settimana precedente')).toBeInTheDocument();
    expect(screen.getByLabelText('Settimana successiva')).toBeInTheDocument();
  });

  it('11. Export menu exists and opens', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /esporta/i }));
    expect(screen.getByText('Esporta come testo')).toBeInTheDocument();
    expect(screen.getByText('Esporta come immagine')).toBeInTheDocument();
  });

  it('12. Activity counter shows correct count', async () => {
    const { user } = setup();
    expect(screen.getByText(/0 attività/i)).toBeInTheDocument();
    await createActivity(user, 'Prima');
    await waitFor(() => {
      expect(screen.getByText(/1 attività/i)).toBeInTheDocument();
    });
  });
});
