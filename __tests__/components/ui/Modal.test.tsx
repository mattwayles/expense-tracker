import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, ConfirmModal } from '@/components/ui/Modal';

// ── Modal ────────────────────────────────────────────────────────────────────

describe('Modal', () => {
  it('renders its children when open=true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders the title when open=true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Title">
        <span />
      </Modal>
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('does not render anything when open=false', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Hidden">
        <p>Should not appear</p>
      </Modal>
    );
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('calls onClose when the X button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open={true} onClose={onClose} title="Close Test">
        <span />
      </Modal>
    );
    await user.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <Modal open={true} onClose={onClose} title="Backdrop Test">
        <span />
      </Modal>
    );
    // The backdrop is the absolute-positioned div behind the modal content
    const backdrop = container.querySelector('.absolute.inset-0') as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the Escape key is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open={true} onClose={onClose} title="Escape Test">
        <span />
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose on Escape when the modal is closed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open={false} onClose={onClose} title="Closed">
        <span />
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ── ConfirmModal ─────────────────────────────────────────────────────────────

describe('ConfirmModal', () => {
  it('renders the description text when open', () => {
    render(
      <ConfirmModal
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirm"
        description="Are you sure?"
      />
    );
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete"
        description="Delete this?"
        confirmLabel="Delete"
      />
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('uses the default confirmLabel "Confirm" when none is provided', () => {
    render(
      <ConfirmModal
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Go"
        description="Proceed?"
      />
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('applies danger (red) styling when danger=true', () => {
    render(
      <ConfirmModal
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        description="Delete?"
        confirmLabel="Delete"
        danger={true}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(confirmBtn.className).toContain('bg-red-500');
  });

  it('applies indigo styling when danger=false', () => {
    render(
      <ConfirmModal
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Go"
        description="Proceed?"
        confirmLabel="Go"
        danger={false}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: 'Go' });
    expect(confirmBtn.className).toContain('bg-indigo-600');
  });

  it('calls onClose when the Cancel button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmModal
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Confirm"
        description="Are you sure?"
      />
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not render when open=false', () => {
    render(
      <ConfirmModal
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Hidden"
        description="Should not appear"
      />
    );
    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
  });
});
