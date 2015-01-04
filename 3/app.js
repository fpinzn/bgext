/*
1. load dom
2. get canvas & video elems
3. try:
        set video src
        add loaded data listener
        find video size
        play video
        execute demo_app & request animation frame
    catch: display error
4. demo_app:
    get canvas context & dimensions
    set drawing color and stroke
    define & allocate curr_img_pyr & prev_img_pyr image pyramides
    define point_count,
    define point_status, prev_xy and curr_xy as arrays with their sizes.
    define options and gui.
5. tick:
    request animation frame
    draw the frame in the canvas
    get image data from the canvas into imageData
    current_x&y & current_image_pyr -> previous
    convert imageData to grayscale
    build the pyramid curr_img_pyr using the grayscale imageData
    call the optical flow algorithm, using the current & previous pyramid, current and previous xy, and the options.
5. prune:
    for i<point_count:
        if point_status[i]==1

*/
$(window).load(function() {
        "use strict";
        // lets do some fun
        var video = document.getElementById('video');
        var canvas = document.getElementById('canvas');
        var d3vertices = [];
        window.vert = d3vertices;
        try {
            var attempts = 0;
            var readyListener = function(event) {
				//console.log("readyListener");
				findVideoSize();
				video.play();

            };
            var findVideoSize = function() {
                if(video.videoWidth > 0 && video.videoHeight > 0) {
                    video.removeEventListener('loadeddata', readyListener);
                    onDimensionsReady(video.videoWidth, video.videoHeight);
                } else {
                    if(attempts < 10) {
                        attempts++;
                        setTimeout(findVideoSize, 200);
                    } else {
                        onDimensionsReady(videoWidth, videoHeight);
                    }
                }
            };
            window.sizer = findVideoSize;
            var onDimensionsReady = function(width, height) {
                demo_app(width, height);
                compatibility.requestAnimationFrame(tick);
            };
			video.src = "/video/adventure.mp4";
            video.addEventListener('loadeddata', readyListener);

        } catch (error) {
            $('#canvas').hide();
            $('#log').hide();
            $('#no_rtc').html('<h4>Something goes wrong...</h4>');
            $('#no_rtc').show();
        }

        var voronoi, svg, path;
        var gui,options,ctx,canvasWidth,canvasHeight;
        var curr_img_pyr, prev_img_pyr, point_count, point_status, prev_xy, curr_xy;

        var demo_opt = function(){
            this.win_size = 10;
            this.max_iterations = 30;
            this.epsilon = 0.2;
            this.min_eigen = 0;
            this.number_points = 10;
        }

        function set_up_voronoi(width, height){
            AA.n(width).n(height);
            console.log("setup voronoi", width, height);
            voronoi = d3.geom.voronoi()
                .clipExtent([[0, 0], [width, height]]);
            svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
                //.on("mousemove", function() { vertices[0] = d3.mouse(this); redraw_voronoi(); });

            path = svg.append("g").selectAll("path");

        }

        function redraw_voronoi() {
            ////console.log("redraw voronoi");
            d3vertices = _.unique(d3vertices);
            //console.log("redraw voronoi d3vertices", voronoi(d3vertices));
            path = path
              .data(voronoi(d3vertices), polygon);

            path.exit().remove();

            path.enter().append("path")
              .attr("class", "q")
              .attr("d", polygon);

            path.order();
        }

        function polygon(d) {
            return "M" + d.join("L") + "Z";
        }

        function demo_app(videoWidth, videoHeight) {
            canvasWidth  = canvas.width = 720;
            canvasHeight = canvas.height = 562;
            ctx = canvas.getContext('2d');

            curr_img_pyr = new jsfeat.pyramid_t(3);
            prev_img_pyr = new jsfeat.pyramid_t(3);
            curr_img_pyr.allocate(videoWidth, videoHeight, jsfeat.U8_t|jsfeat.C1_t);
            prev_img_pyr.allocate(videoWidth, videoHeight, jsfeat.U8_t|jsfeat.C1_t);

            point_count = 0;
            point_status = new Uint8Array(100);
            prev_xy = new Float32Array(100*2);
            curr_xy = new Float32Array(100*2);

            d3vertices = [];

            options = new demo_opt();
            gui = new dat.GUI();

            gui.add(options, 'win_size', 7, 30).step(1);
            gui.add(options, 'max_iterations', 3, 100).step(1);
            gui.add(options, 'epsilon', 0.001, 0.7).step(0.0025);
            gui.add(options, 'min_eigen', 0, 0.01).step(0.0025);
            gui.add(options, 'number_points', 2, 100).step(1).onChange(function(){
                d3vertices = [];
                create_field();
            });
            set_up_voronoi(canvasWidth,canvasHeight);
            create_field();
        }

        function tick() {
            compatibility.requestAnimationFrame(tick);

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // swap flow data
                var _pt_xy = prev_xy;
                prev_xy = curr_xy;
                curr_xy = _pt_xy;
                var _pyr = prev_img_pyr;
                prev_img_pyr = curr_img_pyr;
                curr_img_pyr = _pyr;

                jsfeat.imgproc.grayscale(imageData.data, canvas.width, canvas.height, curr_img_pyr.data[0]);

                curr_img_pyr.build(curr_img_pyr.data[0], true);

                jsfeat.optical_flow_lk.track(prev_img_pyr, curr_img_pyr, prev_xy, curr_xy, point_count, options.win_size|0, options.max_iterations|0, point_status, options.epsilon, options.min_eigen);

                prune_oflow_points(ctx);
                redraw_voronoi();
            }
        }


        function draw_circle(ctx, x, y) {
            ////console.log(x,y);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI*2, true);
            ctx.fill();
        }

        function create_field(){
            ////console.log("create_field", options.number_points);

            point_status = new Uint8Array(100);
            prev_xy = new Float32Array(100*2);
            curr_xy = new Float32Array(100*2);

            var xFactor = canvasWidth*0.9/options.number_points;
            var yFactor = canvasHeight*0.9/options.number_points;
            var xOffset = canvasWidth*0.05;
            var yOffset = canvasHeight*0.05;
            //console.log("canvas", canvasWidth, canvasHeight);

            d3vertices = [];

            point_count = 0;

            for(var i=0; i<options.number_points; i++){
                for(var j=0; j<options.number_points; j++){
                    add_point(i*xFactor+xOffset,j*yFactor+yOffset);
                }
            }
        }

        function add_point(x,y){
            curr_xy[point_count<<1] = x;
            curr_xy[(point_count<<1)+1] = y;
            point_count++;
            console.log("add", x,y, point_count);
            d3vertices.push([x, y]);
            //console.log("d3Vertices",d3vertices );
        }

        function prune_oflow_points(ctx) {
            for(var i=0; i < point_count; ++i) {
                var x = i<<1;
                //console.log("outsideif", i, x);

                ////console.log("draw_circle:", point_status[i] == 1, curr_xy[x], curr_xy[x+1]);
                if(point_status[i] == 1) {
                    ctx.fillStyle = "rgb(0,255,0)";
                    ctx.strokeStyle = "rgb(0,255,0)";
                }
                else{
                    //TODO: Lost point
                    ctx.fillStyle = "rgb(255,0,0)";
                    ctx.strokeStyle = "rgb(255,0,0)";

                    curr_xy[x] = Math.random() *canvasWidth;
                    curr_xy[x+1] = Math.random() *canvasHeight;

                    console.log("d3vertices[i]",i, d3vertices[i]);
                }
                d3vertices[i] = [curr_xy[x], curr_xy[x+1]];
                draw_circle(ctx, curr_xy[x], curr_xy[x+1]);
            }
            window.vert = d3vertices;
        }


        $(window).unload(function() {
            video.pause();
            video.src=null;
        });
    });
