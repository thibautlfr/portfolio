# Bowser Bros' capture tool: the game's own sources, unchanged, with a main that drives them
# frame by frame instead of a window. The game's repository sits next to the portfolio.
GAME = $$PWD/../../../../IUT-BowserBros/BowserBros/App

QT += core gui widgets multimedia
CONFIG += c++17
CONFIG -= app_bundle
TARGET = capture

INCLUDEPATH += $$GAME
SOURCES += capture.cpp $$files($$GAME/*.cpp)
SOURCES -= $$GAME/main.cpp
HEADERS += $$files($$GAME/*.h)
FORMS += $$files($$GAME/*.ui)
RESOURCES += $$GAME/ressources.qrc
