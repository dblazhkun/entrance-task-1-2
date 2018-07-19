# Задание 1 — найди ошибки

В этом репозитории находятся материалы тестового задания "Найди ошибки" для [14-й Школы разработки интерфейсов](https://academy.yandex.ru/events/frontend/shri_msk-2018-2) (осень 2018, Москва, Санкт-Петербург, Симферополь).

Для работы тестового приложения нужен Node.JS v9. В проекте используются [Yandex Maps API](https://tech.yandex.ru/maps/doc/jsapi/2.1/quick-start/index-docpage/) и [ChartJS](http://www.chartjs.org).

## Задание

Код содержит ошибки разной степени критичности. Некоторые из них — стилистические, а другие — даже не позволят вам запустить приложение. Вам нужно найти все ошибки и исправить их.

Пункты для самопроверки:

1. Приложение должно успешно запускаться.
1. По адресу http://localhost:9000 должна открываться карта с метками.
1. Должна правильно работать вся функциональность, перечисленная в условиях задания.
1. Не должно быть лишнего кода.
1. Все должно быть в едином codestyle.

## Запуск

```
npm i
npm start
```

При каждом запуске тестовые данные генерируются заново случайным образом.

---

# Ход решения

### Проблема №1
При старте приложения, в консоль выводится предупреждение:
```
WARNING in ./src/index.js 4:2-9
"export 'default' (imported as 'initMap') was not found in './map'
```
#### Решение
В index.js импортируется initMap как функция по умолчанию, но экспортируется она из map.js без ключевого слова default. Для синтаксически верного импорта необходимо обернуть initMap в фигурные скобки, но правильней будет экспортировать initMap как функцию по умолчанию. Этот же принцип справедлив и для других модулей, описывающих какую-то одну сущность.

### Проблема №2
Приложение стартует, видимых ошибок нет, но на странице ничего не отображается.
#### Решение
В отладчике браузера видно, что в нашем контейнере появились элементы ymaps, но они никак не "растягивают" его. Смотрим в документацию к API Карт, в которой сказано, что контейнер должен быть **ненулевого** размера. Добавляем контейнеру стили, задающие ему ширину и высоту равными размерам окна браузера, согласно заданию.

### Проблема №3
Не отображаются метки на карте.
#### Решение
Узнаём из документации, что созданный objectManager необходимо добавить на карту вызовом ```myMap.geoObjects.add(objectManager)```

### Проблема №4
Метки отрисовываются не в координатах Москвы, а на севере Ирана.
#### Решение
Смотрим, что выдаёт функция generateData, отвечающуая за генерацию в том числе координат. Видим, что она генерирует значения в верном диапазоне. Но эти данные не попадают в objectManager напрямую, а мапятся через адаптер mapServerData под требуемый api формат, и здесь допущена ошибка в порядке указания широты и долготы. Меняем coordinates: ```coordinates: [obj.long, obj.lat]``` на ```coordinates: [obj.lat, obj.long]```.

### Проблема №5
Все кластеры отображаются полностью зелёными, а по заданию требуется, чтобы иконка кластера, содержащего неисправные станции, как-то отображала это.
#### Решение
Самым очевидным решением представляется стилизация иконки кластера в виде круговой диаграммы, и, при создании инстанса ObjectManager такая настройка указывается, но затем перебивается следующей строкой: ```objectManager.clusters.options.set('preset', 'islands#greenClusterIcons')```. Решаем проблему удалением этой строки.

### Проблема №6
По клику на станцию ничего не происходит, при повторном клике ошибка:
```
Uncaught TypeError: Cannot read property 'destroy' of null
```
#### Решение
В инстансе ```ObjectManager``` в поле ```geoObjectBalloonContentLayout``` используется ```getDetailsContentLayout``` из модуля details, для создания кастомного шаблона попапа. В ней определены кастомные методы методы build и clear. Если эти методы заккоментировать, начинают работать дефолтные метода и попап появляется. Но нам нужны кастомные методы, которые производят загрузку данных и работу с чартом. Из сообщения ошибки понятно, что где-то происходит потеря контекста, и код методов активно ссыается на ```this```. При этом в методаих используются стрелоченые функции, которые не имеют своего ```this```. Меняем стрелочные функции на function, и отображение попапа начинает работать.

### Проблема №7
В попапе отображается пустой чарт.
#### Решение
В модуле chart, в настройках чарта установлено ограничение по оси Y, в результате которого чарт отрисовывается в отрицательном диапазоне по шкале Y, в то время как представляемые данные представленны в положительном диапазоне. Убираем ```max: 0``` из поля ```yAxes```.

### Проблема №8
В попапе нет информации о координатах станции.
#### Решение
В модуле details дополняем шаблон следующей строкой:
```<div class="details-coords">{{properties.details.lat}}, {{properties.details.long}}</div>```
Добавляем немного стилей этому элементу.

### Проблема №9
Не должно быть лишнего кода.
#### Решение
Модуль popup и функция экспортируемая из него не участвуют в работе приложения. Удаляем этот модуль. Удаляем вызовы ```console.log```.

### Проблема №10
Все должно быть в едином codestyle.
#### Решение
Для этого стоит воспользоваться линтером. Было интересно попробовать [standard](https://standardjs.com/). Подключил и оформил код по его требованиям. Плюс, наверное, это тоже можно отнести к стилю кодирования, сделал экспорт по умолчанию в тех модулях, которые экспортируют из себя одну сущность.