// Renders Bowser Bros (2023) to PNG frames, deterministically.
//
// The game runs on a 10 ms QTimer and reads the keyboard. Here its timers are stopped and
// GameForm::gameloop() is called by hand, one tick per 10 ms of game time, with key events sent
// on given ticks: a run is the same on every machine and every time, whatever the load.
// Frames are rendered from the widgets at twice their size, with no window and no screen
// recording (run with QT_QPA_PLATFORM=offscreen).
//
// Usage:
//   capture still <menu|training|scoreboard> <out.png>
//   capture map <level> <out.png>                     the whole level, 800 × 1200
//   capture run <level> <script> <ticks> <every> <dir>   frames every <every> ticks
//
// A script has one event per line, "<tick> <left|right|space|up|down> <down|up>"; "#" starts a
// comment. Each frame's tick and Mario's position are printed, to write the next script.
//
// The game reads its scoreboard and settings from paths relative to the working directory
// ("../../../../../DataBase/ScoreBoard.json" on macOS): run it from a folder five levels below
// one that holds DataBase/ and Settings/.

#include <QApplication>
#include <QDir>
#include <QFile>
#include <QImage>
#include <QKeyEvent>
#include <QPainter>
#include <QStackedWidget>
#include <QTextStream>
#include <QTimer>
#include <map>
#include <vector>

// Read access to the game's state (Mario's position, its timers) for the log and to stop the
// clock. Only this file sees it; the game's sources are compiled as they are.
#define private public
#include "widget.h"
#include "gameform.h"
#include "menuform.h"
#include "trainingform.h"
#undef private

namespace {

constexpr int scale = 2;

QImage render(QWidget *widget)
{
    QImage image(widget->size() * scale, QImage::Format_ARGB32);
    image.setDevicePixelRatio(scale);
    image.fill(Qt::black);
    widget->render(&image);
    return image;
}

void settle()
{
    for (int i = 0; i < 5; ++i)
        QApplication::processEvents();
}

void mute(MenuForm *menu)
{
    menu->getSoundManager()->setMainVolume(0);
    menu->getSoundManager()->setEffectsVolume(0);
    menu->getSoundManager()->stopAllSounds();
}

// Stops the game's own clock: from here, time only moves when gameloop() is called.
void freeze(GameForm *game)
{
    game->itsTimer->stop();
    game->marioTimer->stop();
    game->soundManager->setMainVolume(0);
    game->soundManager->setEffectsVolume(0);
    game->soundManager->stopAllSounds();
}

struct Event {
    int key;
    bool press;
};

std::multimap<int, Event> readScript(const QString &path)
{
    static const std::map<QString, int> keys = {
        {"left", Qt::Key_Left}, {"right", Qt::Key_Right}, {"space", Qt::Key_Space},
        {"up", Qt::Key_Up},     {"down", Qt::Key_Down},
    };
    std::multimap<int, Event> events;
    QFile file(path);
    if (!file.open(QIODevice::ReadOnly))
        qFatal("Cannot read %s", qPrintable(path));
    QTextStream in(&file);
    while (!in.atEnd()) {
        const QString line = in.readLine().section('#', 0, 0).trimmed();
        if (line.isEmpty())
            continue;
        const QStringList parts = line.split(' ', Qt::SkipEmptyParts);
        if (parts.size() != 3 || !keys.count(parts[1]))
            qFatal("Bad script line: %s", qPrintable(line));
        events.insert({parts[0].toInt(), {keys.at(parts[1]), parts[2] == "down"}});
    }
    return events;
}

void send(GameForm *game, const Event &event)
{
    QKeyEvent key(event.press ? QEvent::KeyPress : QEvent::KeyRelease, event.key, Qt::NoModifier);
    QApplication::sendEvent(game, &key);
}

}  // namespace

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    const QStringList args = app.arguments();
    if (args.size() < 4)
        qFatal("See the usage at the top of capture.cpp");
    const QString mode = args[1];

    Widget window;
    window.resize(800, 600);
    window.show();
    settle();

    auto *stack = window.findChild<QStackedWidget *>();
    auto *menu = window.findChild<MenuForm *>();
    mute(menu);

    if (mode == "still") {
        const QString screen = args[2];
        if (screen == "training")
            emit menu->trainingButtonClicked();
        else if (screen == "scoreboard")
            emit menu->podiumButtonClicked();
        settle();
        mute(menu);
        return render(stack).save(args[3]) ? 0 : 1;
    }

    // Training mode opens a given level, and stays on it when the chest is reached.
    const int level = args[2].toInt();
    emit menu->trainingButtonClicked();
    settle();
    emit window.findChild<TrainingForm *>()->levelSelected(level);
    settle();
    auto *game = window.findChild<GameForm *>();
    freeze(game);
    mute(menu);

    if (mode == "map") {
        // The whole level, with no camera: the paint event draws all of it.
        QImage image(game->size() * scale, QImage::Format_ARGB32);
        image.setDevicePixelRatio(scale);
        QPainter painter(&image);
        game->updateScroll();
        game->render(&painter);
        return image.save(args[3]) ? 0 : 1;
    }

    if (mode == "run") {
        const auto events = readScript(args[3]);
        const int ticks = args[4].toInt();
        const int every = args[5].toInt();
        QDir().mkpath(args[6]);
        int frame = 0;
        for (int tick = 0; tick < ticks; ++tick) {
            auto [first, last] = events.equal_range(tick);
            for (auto it = first; it != last; ++it)
                send(game, it->second);
            if (game->itsCharacter->getIsDead())
                game->animationDeath();
            else
                game->gameloop();
            if (tick % every == 0) {
                const QString name = QString("%1/%2.png").arg(args[6]).arg(frame++, 4, 10, QChar('0'));
                render(stack).save(name);
                printf("frame %4d tick %5d mario %6.1f %6.1f%s%s\n", frame - 1, tick,
                       game->itsCharacter->getItsX(), game->itsCharacter->getItsY(),
                       game->itsCharacter->getOnLadder() ? " ladder" : "",
                       game->itsCharacter->getIsDead() ? " dead" : "");
            }
        }
        return 0;
    }

    qFatal("Unknown mode %s", qPrintable(mode));
}
