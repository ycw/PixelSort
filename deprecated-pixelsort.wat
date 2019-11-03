(module
    (import "env" "memory" (memory $mem 1))
   
    ;;
    ;; rgb to lum (0.299*R + 0.587*G + 0.114*B)
    ;;
    (func $lum 
        (param $n i32)
        (result f64)

        ;; 0.299 * R ... (1)
        get_local $n
        i32.const 4
        i32.mul 
        i32.load8_u 
        f64.convert_u/i32
        f64.const 0.299
        f64.mul

        ;; 0.587 * G ... (2)
        get_local $n 
        i32.const 4
        i32.mul
        i32.const 1
        i32.add
        i32.load8_u
        f64.convert_u/i32
        f64.const 0.587 
        f64.mul

        ;; (1) + (2) ... (3)
        f64.add 

        ;; 0.114 * B ... (4)
        get_local $n 
        i32.const 4
        i32.mul
        i32.const 2
        i32.add
        i32.load8_u
        f64.convert_u/i32
        f64.const 0.114 
        f64.mul

        ;; (3) + (4)
        f64.add

        ;; =0.299R + 0.587G + 0.114B 
    )
    


    ;;
    ;; Sort pixels in single partition; returns new pivot index
    ;;
    (func $sort
        (export "pixelSort")
        
        (param $front i32)
        (param $end i32)
        (param $threshold i32)
        
        (result i32)

        (local $i i32)
        (local $j i32)
        (local $pivot f64)

        ;;
        ;; Quit (-1) if partition size > $threshold
        ;;
        get_local $front 
        get_local $threshold
        i32.add 
        get_local $end
        i32.gt_s 
        if 
            i32.const -1
            return
        end

        ;;
        ;; $i is at ($front-1)
        ;;
        get_local $front
        i32.const 1
        i32.sub
        set_local $i

        ;;
        ;; $j is at $front
        ;;
        get_local $front
        set_local $j

        ;;
        ;; $pivot is the lum value of last pixel
        ;;
        get_local $end
        call $lum 
        set_local $pivot

        ;;
        ;; loop from $front to ($end-1)
        ;;
        loop $LOOP

            ;;
            ;; IF lum value of pixel[$j] < $pivot, inc $i
            ;;
            get_local $j 
            call $lum
            get_local $pivot
            f64.lt
            if 
                get_local $i 
                i32.const 1
                i32.add 
                set_local $i 
                
                ;;
                ;; IF $i < $j, swap pixel
                ;;
                get_local $i 
                get_local $j
                i32.lt_s
                if
                    get_local $i 
                    get_local $j
                    call $swapRGBA
                end
            end

            ;;
            ;; advance $j
            ;;
            get_local $j
            i32.const 1
            i32.add
            tee_local $j

            ;;
            ;; If $j at $end, swap pixel[$end] <-> pixel[$i+1]
            ;; othewise, enter next iter
            ;;
            get_local $end 
            i32.eq 
            if 
                get_local $end 
                get_local $i 
                i32.const 1
                i32.add 
                tee_local $i
                call $swapRGBA
            else 
                br $LOOP
            end
        end

        ;;
        ;; return new index of pivot point
        ;;
        get_local $i
        return  
    )



    ;;
    ;; Swap rgba values between two pixels
    ;;
    (func $swapRGBA
        (param $i i32) ;; pixel index
        (param $j i32) ;; ditto

        ;;
        ;; swap R 
        ;;
        get_local $i 
        i32.const 4
        i32.mul 
        get_local $j 
        i32.const 4
        i32.mul 
        call $swap

        ;;
        ;; swap G
        ;;
        get_local $i 
        i32.const 4
        i32.mul 
        i32.const 1
        i32.add 
        get_local $j 
        i32.const 4
        i32.mul 
        i32.const 1
        i32.add 
        call $swap

        ;;
        ;; swap B
        ;;
        get_local $i 
        i32.const 4
        i32.mul 
        i32.const 2
        i32.add 
        get_local $j 
        i32.const 4
        i32.mul 
        i32.const 2
        i32.add 
        call $swap

        ;;
        ;; swap A 
        ;;
        get_local $i 
        i32.const 4
        i32.mul 
        i32.const 3
        i32.add 
        get_local $j 
        i32.const 4
        i32.mul 
        i32.const 3
        i32.add 
        call $swap
    )



    ;;
    ;; Swap value between 2 addrs
    ;;
    (func $swap
        (param $i i32) ;; byte offset
        (param $j i32) ;; ditto

        (local $tmp i32)

        ;; 
        ;; store mem[$i] -> $tmp
        ;;
        get_local $i 
        i32.load8_u
        set_local $tmp

        ;;
        ;; store mem[$j] -> mem[$i]
        ;;
        get_local $i
        get_local $j
        i32.load8_u
        i32.store8

        ;;
        ;; store $tmp to mem[$j]
        ;; 
        get_local $j
        get_local $tmp
        i32.store8 
    )
)