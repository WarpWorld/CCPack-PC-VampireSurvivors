import type { VampireSurvivorsGame } from '.'

export const initIntro = (game: VampireSurvivorsGame) => {
  const MainMenuScene = game.Core.SceneManager.UI_mainMenu
  const _show = MainMenuScene.Show

  MainMenuScene.Show = () => {
    window.Game = game
    const text = MainMenuScene.add.text(10, 10, 'With\rCrowd Control', {
      fontFamily: game.Lang.FONTFAMILY,
      fontSize: '36px',
      color: '#ffffff',
      bold: true,
      align: 'center',
      padding: {
        x: 2,
        y: 2,
      },
      shadow: {
        color: '#000',
        offsetX: -1,
        offsetY: 1,
        fill: true,
      },
    })

    text.setOrigin(0.5, 0.5)
    text.setX(MainMenuScene.renderer.width / 2)
    text.setY(MainMenuScene.renderer.height / 2)
    text.setRotation(25)
    text.setScale(0)

    game.Core.SceneManager.UI_mainMenu.tweens.add({
      targets: text,
      scale: 1,
      ease: 'Bounce',
      duration: 500,
      delay: 500,
    })

    _show.call(MainMenuScene)
  }
}
