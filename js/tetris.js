(function() {
    'use strict';

    var COLS = 10, ROWS = 20;  // 横10、縦20マス
    var board = [];  // 盤面情報
    var lose;  // 一番上までいっちゃったかどうか
    var interval;  // ゲームを実行するタイマーを保持する変数
    var current; // 今操作しているブロックの形
    var currentX, currentY; // 今操作しているブロックの位置
    var message = document.getElementById('message');  //GAMEOVERメッセージ

    // 操作するブロックのパターン
    var shapes = [
        [ 1, 1, 1, 1 ],
        [ 1, 1, 1, 0,
          1 ],
        [ 1, 1, 1, 0,
          0, 0, 1 ],
        [ 1, 1, 0, 0,
          1, 1 ],
        [ 1, 1, 0, 0,
          0, 1, 1 ],
        [ 0, 1, 1, 0,
          1, 1 ],
        [ 0, 1, 0, 0,
          1, 1, 1 ]
      ];

    // ブロックの色
    var colors = [
                    'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple'
    ];


    // 盤面を空にする
    function init() {
      for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
          board[ y ][ x ] = 0;
        }
      }
    }


    // shapesからランダムにブロックのパターンを出力し、盤面の一番上へセットする
    function newShape() {
      var id = Math.floor( Math.random() * shapes.length );  // ランダムにインデックスを出す
      var shape = shapes[ id ];
      // パターンを操作ブロックへセットする
      current = [];
      for ( var y = 0; y < 4; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
          var i = 4 * y + x;
          if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
            current[ y ][ x ] = id + 1;
          }
          else {
            current[ y ][ x ] = 0;
          }
        }
      }
      // ブロックを盤面の上のほうにセットする
      currentX = 4;
      currentY = 0;
    }


    function tick() {
      // １つ下へ移動する
      if ( valid( 0, 1 ) ) {
        ++currentY;
      }
      // もし着地していたら(１つしたにブロックがあったら)
      else {
        freeze();  // 操作ブロックを盤面へ固定する
        clearLines();  // ライン消去処理
        if (lose) {
          // もしゲームオーバなら最初から始める
          newGame();
          return false;
        }
        // 新しい操作ブロックをセットする
        newShape();
      }
    }


    // 指定された方向に、操作ブロックを動かせるかどうかチェックする
    // ゲームオーバー判定もここで行う
    function valid( offsetX, offsetY, newCurrent ) {
      offsetX = offsetX || 0;
      offsetY = offsetY || 0;
      offsetX = currentX + offsetX;
      offsetY = currentY + offsetY;
      newCurrent = newCurrent || current;
      for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
          if ( newCurrent[ y ][ x ] ) {
            if ( typeof board[ y + offsetY ] == 'undefined'
                 || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                 || board[ y + offsetY ][ x + offsetX ]
                 || x + offsetX < 0
                 || y + offsetY >= ROWS
                 || x + offsetX >= COLS ) {
                        if (offsetY == 1 && offsetX - currentX == 0 && offsetY - currentY == 1) {
                            //confirm('game over');
                            message.classList.remove('disabled');   //GAMEOVERメッセージ表示
                            clearInterval(interval);
                            suspend.classList.add('disabled');
                            controlKey.classList.add('disabled');
                            render();

                            //lose = true; // もし操作ブロックが盤面の上にあったらゲームオーバーにする
                        }
                   return false;
                 }
          }
        }
      }
      return true;
    }


    // 操作ブロックを盤面にセットする関数
    function freeze() {
      for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
          if ( current[ y ][ x ] ) {
            board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
          }
        }
      }
    }


    // 一行が揃っているか調べ、揃っていたらそれらを消す
    function clearLines() {
      for ( var y = ROWS - 1; y >= 0; --y ) {
        var rowFilled = true;
        // 一行が揃っているか調べる
        for ( var x = 0; x < COLS; ++x ) {
          if ( board[ y ][ x ] == 0 ) {
            rowFilled = false;
            break;
          }
        }
        // もし一行揃っていたら, サウンドを鳴らしてそれらを消す。
        if ( rowFilled ) {
          document.getElementById( 'clearsound' ).play();  // 消滅サウンドを鳴らす
          // その上にあったブロックを一つずつ落としていく
          for ( var yy = y; yy > 0; --yy ) {
            for ( x = 0; x < COLS; ++x ) {
              board[ yy ][ x ] = board[ yy - 1 ][ x ];
            }
          }
          ++y;  // 一行落としたのでチェック処理を一つ下へ送る
        }
      }
    }


    // キーボードが押された時に呼び出される関数
    function keyPress( mykey ) {
      switch ( mykey ) {
      case 'left':
        if ( valid( -1 ) ) {
          --currentX;  // 左に一つずらす
        }
        break;
      case 'right':
        if ( valid( 1 ) ) {
          ++currentX;  // 右に一つずらす
        }
        break;
      case 'down':
        if ( valid( 0, 1 ) ) {
          ++currentY;  // 下に一つずらす
        }
        break;
      case 'rotate':
        // 操作ブロックを回す
        var rotated = rotate( current );
        if ( valid( 0, 0, rotated ) ) {
          current = rotated;  // 回せる場合は回したあとの状態に操作ブロックをセットする
        }
        break;
      case 'suspend':
        // currentブロックを一時停止 or 再開
        if(suspendFlag == false) {
            clearInterval(interval);
            suspendFlag = true;
            suspend.textContent = ' ▶ ';
            controlKey.classList.add('disabled');
        } else {
            interval = setInterval( tick, 500 );
            tick();
            suspendFlag = false;
            suspend.textContent = ' | | ';
            controlKey.classList.remove('disabled');
        }
        break;
      }
    }


    // 操作ブロックを回す処理
    function rotate( current ) {
      var newCurrent = [];
      for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
          newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
        }
      }
      return newCurrent;
    }


    /////////////////////////////////////////////////////////////////////////////////////////
    // controller.js 部
    /////////////////////////////////////////////////////////////////////////////////////////
    /*
     キーボードを入力した時に一番最初に呼び出される処理
     */

     /*
    document.body.onkeydown = function( e ) {
      // キーに名前をセットする
      var keys = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate'
      };

      if ( typeof keys[ e.keyCode ] != 'undefined' ) {
        // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
        keyPress( keys[ e.keyCode ] );
        // 描画処理を行う
        render();
      }
    };
*/

    //pcでもスマホでもボタン操作動くように変数定義
    var EVENTNAME_TOUCHSTART, EVENTNAME_TOUCHEND;

    if ('ontouchend' in document) {
        EVENTNAME_TOUCHSTART = 'touchstart';
        EVENTNAME_TOUCHEND = 'touchend';
    }else{
        EVENTNAME_TOUCHSTART = 'click';     //'mousedown' がいい場合もある
        EVENTNAME_TOUCHEND = 'mouseup';
    }

    var btnUp = document.getElementById('btnUp');
    var btnDown = document.getElementById('btnDown');
    var btnLeft = document.getElementById('btnLeft');
    var btnRight = document.getElementById('btnRight');
    var suspend = document.getElementById('suspend');
    var controlKey = document.getElementById('controlKey');
    var suspendFlag = false;
    var myKey;


    btnUp.addEventListener(EVENTNAME_TOUCHSTART, function(){
        myKey = 'rotate';
        // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
        keyPress(myKey);
        // 描画処理を行う
        render();
    });

    btnDown.addEventListener(EVENTNAME_TOUCHSTART, function(){
        myKey = 'down';
        // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
        keyPress(myKey);
        // 描画処理を行う
        render();
    });

    btnLeft.addEventListener(EVENTNAME_TOUCHSTART, function(){
        myKey = 'left';
        // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
        keyPress(myKey);
        // 描画処理を行う
        render();
    });

    btnRight.addEventListener(EVENTNAME_TOUCHSTART, function(){
        myKey = 'right';
        // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
        keyPress(myKey);
        // 描画処理を行う
        render();
    });

    suspend.addEventListener(EVENTNAME_TOUCHSTART, function(){
        myKey = 'suspend';
        // セットされたキーの場合はtetris.jsに記述された処理を呼び出す
        keyPress(myKey);
        // 描画処理を行う
        render();
    });


    message.addEventListener(EVENTNAME_TOUCHSTART, function(){
        lose = true;
        controlKey.classList.remove('disabled'); //コントロールキー表示
        suspend.classList.remove('disabled'); //一時停止キー表示
        newGame();
    });



    //ダブルタップ禁止
    let lastTouch = 0;
    document.addEventListener('touchend', event => {
        const now = window.performance.now();
        if (now - lastTouch <= 500) {
            event.preventDefault();
        }
        lastTouch = now;
    }, true);



    /////////////////////////////////////////////////////////////////////////////////////////
    // render.js 部
    /////////////////////////////////////////////////////////////////////////////////////////
    /*
     現在の盤面の状態を描画する処理
     */
    var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];  // キャンバス
    var ctx = canvas.getContext( '2d' ); // コンテクスト
    var W = 300, H = 600;  // キャンバスのサイズ
    var BLOCK_W = W / COLS, BLOCK_H = H / ROWS;  // マスの幅を設定


    // x, yの部分へマスを描画する処理
    function drawBlock( x, y ) {
      ctx.fillRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
      ctx.strokeRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
    }


    // 盤面と操作ブロックを描画する
    function render() {
      ctx.clearRect( 0, 0, W, H );  // 一度キャンバスを真っさらにする
      ctx.strokeStyle = 'black';  // えんぴつの色を黒にする

      // 盤面を描画する
      for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 0; y < ROWS; ++y ) {
          if ( board[ y ][ x ] ) {  // マスが空、つまり0ではなかったら
            ctx.fillStyle = colors[ board[ y ][ x ] - 1 ];  // マスの種類に合わせて塗りつぶす色を設定
            drawBlock( x, y );  // マスを描画
          }
        }
      }

      // 操作ブロックを描画する
      for ( y = 0; y < 4; ++y ) {
        for ( x = 0; x < 4; ++x ) {
          if ( current[ y ][ x ] ) {
            ctx.fillStyle = colors[ current[ y ][ x ] - 1 ];  // マスの種類に合わせて塗りつぶす色を設定
            drawBlock( currentX + x, currentY + y );  // マスを描画
          }
        }
      }
    }

    // 30ミリ秒ごとに状態を描画する関数を呼び出す
    setInterval( render, 30 );


    ///////////////////////////////////////////////////
    // スマホレスポンシブ      ※うまくいかない。。
    //////////////////////////////////////////////////
    /*
    var theCanvas = document.getElementById('container');

    function canvas_resize(){
        var windowWidth=window.innerWidth;
        var windowHeight=window.Height;
        theCanvas.setAttribute('width',windowWidth);
        theCanvas.setAttribute('height',windowHeight);
    }

    window.addEventListener('resize',canvas_resize,false);

    canvas_resize();
    */

    ///////////////////////////////////////////////////
    // newGame
    ////////////////////////////////////////////////////


    function newGame() {
        clearInterval(interval);  // ゲームタイマーをクリア
        init();  // 盤面をまっさらにする
        newShape();  // 操作ブロックをセット
        lose = false;  // 負けフラッグ
        //interval = setInterval( tick, 250 );  // 250ミリ秒ごとにtickという関数を呼び出す
        interval = setInterval( tick, 500 );  // 250ミリ秒ごとにtickという関数を呼び出す
        message.classList.add('disabled');   //GAMEOVERメッセージ隠す
    }

    newGame();


})();
