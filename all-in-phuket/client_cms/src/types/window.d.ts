export {};
declare global {
  interface Window {
    add_row_modal: { showModal: () => void; close: () => void };
    dropdown_modal: { showModal: () => void; close: () => void };
  }
}
