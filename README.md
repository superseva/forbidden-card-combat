# Forbidden Lands - Hidden Combinations Cards Combat

## How to use:

Use the GM macro from the included compendium to initiate the combat sequence between GM and selected User.

1. GM clicks the macro and selects active (online) player as the opponent
2. GM and selected opponent pick two cards and click 'continue'
3. GM clicks on the cards to reveal them.

## Macro for GM to initiate a card combat sequence

### (Macro is also included in the compendium with this module)

```
let userList = "";
game.users.entries.forEach((u)=>{
if(u.active && !u.isGM){
userList += `<option value='${u._id}'>${u.name}</option>`;
}
});

let d = new Dialog({
  title: 'Initiate Card Combat',
  content: `
    <form class="flexcol">
      <div class="form-group">
        <label for="userSelect">Initiate Combat With:</label>
        <select name="userSelect"> ${userList}</select>
      </div>
    </form>
  `,
  buttons: {
    no: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Cancel'
    },
    yes: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Yes',
      callback: (html) => {
        let selectedUser = html.find('[name="userSelect"]').val();
CardCombat._instance.initiateCombat(selectedUser );
      }
    },
  },
  default: 'yes',
  close: () => {}
}).render(true);
```
