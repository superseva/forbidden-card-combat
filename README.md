# Forbidden Lands - Hidden Combinations Cards Combat

This is a module for Forbidden Lands game that allows you to utilize the optional combat rules using  Hidden Combinations cards.
It initiates a 'window' where the GM and one Player (selected by GM) can pick their cards and then proceed to reveal them.
It requires at least  a GM and one logged player for you to use it properly.
A GM can find the macro in the packaged compendium that would allow him to initiate a combat sequence.

## How to use:

Use the GM macro from the included compendium to initiate the combat sequence between GM and selected User.

1. GM clicks the macro and selects active (online) player as the opponent
2. GM and selected opponent pick two cards and click 'continue'
3. GM clicks on the cards to reveal them.

## Macro for GM to initiate a card combat sequence

### (Macro is also included in the compendium with this module)

```
let userList = "";
game.users.forEach((u)=>{
if(u.active && !u.isGM){
userList += `<option value='${u.id}'>${u.name}</option>`;
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
