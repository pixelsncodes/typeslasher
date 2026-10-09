import './game-confirm.css';

type Confirmation = { title: string; message: string; accept: string };

export function createGameConfirm(reduced: () => boolean) {
  const dialog = document.createElement('dialog');
  dialog.className = 'game-confirm';
  dialog.setAttribute('aria-labelledby', 'game-confirm-title');
  dialog.setAttribute('aria-describedby', 'game-confirm-message');
  dialog.innerHTML = `<button class="game-confirm-close" type="button" aria-label="Close confirmation">×</button>
    <span class="game-confirm-icon" aria-hidden="true">↻</span>
    <p class="game-confirm-kicker">A CHANGE OF MENU</p>
    <h2 id="game-confirm-title"></h2><p id="game-confirm-message"></p>
    <form method="dialog" class="game-confirm-actions"><button value="cancel" autofocus>Keep my text</button><button class="game-confirm-accept" value="accept"></button></form>`;
  document.body.append(dialog);
  let resolve: ((accepted: boolean) => void) | undefined;
  dialog.querySelector('.game-confirm-close')!.addEventListener('click', () => dialog.close('cancel'));
  dialog.addEventListener('close', () => {
    const pending = resolve; resolve = undefined;
    pending?.(dialog.returnValue === 'accept');
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close('cancel');
  });
  return {
    ask({ title, message, accept }: Confirmation): Promise<boolean> {
      if (resolve) return Promise.resolve(false);
      dialog.querySelector('#game-confirm-title')!.textContent = title;
      dialog.querySelector('#game-confirm-message')!.textContent = message;
      dialog.querySelector('.game-confirm-accept')!.textContent = accept;
      dialog.classList.toggle('calm', reduced());
      dialog.returnValue = 'cancel';
      return new Promise<boolean>(done => { resolve = done; dialog.showModal(); });
    },
  };
}
