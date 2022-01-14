use std::{iter::FromIterator, usize};

use im::Vector;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Clone, Copy, PartialEq)]
struct Rgb {
    r: u8,
    g: u8,
    b: u8,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Image {
    pub width: usize,
    pub height: usize,
    cells: Vector<Rgb>,
}

#[wasm_bindgen]
impl Image {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Self {
        let cells = Vector::from_iter((0..width * height).map(|_| Rgb {
            r: 200,
            g: 200,
            b: 255,
        }));
        Image {
            width,
            height,
            cells,
        }
    }

    pub fn cells(&self) -> Vec<u8> {
        self.cells
            .iter()
            .map(|rgb| vec![rgb.r, rgb.g, rgb.b])
            .collect::<Vec<Vec<u8>>>()
            .concat()
    }

    pub fn brush(&mut self, x: usize, y: usize, color: Vec<u8>) -> Option<Image> {
        let c = Rgb {
            r: color[0],
            g: color[1],
            b: color[2],
        };
        let index = (y * self.width) + x;
        let exist_col = self.cells[index];
        if exist_col == c {
            web_sys::console::log_1(&"Color is the same, skip update!".into());
            return None;
        }

        let new_cell = self.cells.update(index, c);
        Some(Image {
            width: self.width,
            height: self.height,
            cells: new_cell,
        })
    }
}

#[derive(Clone)]
struct UndoQueue<T: Clone> {
    queue: Vec<T>,
    index: usize,
}

impl<T: Clone> UndoQueue<T> {
    fn new(entry: T) -> Self {
        UndoQueue {
            queue: vec![entry],
            index: 0,
        }
    }

    fn current(&self) -> T {
        self.queue[self.index].clone()
    }

    fn push(&mut self, entry: T) {
        self.queue.truncate(self.index + 1);
        self.queue.push(entry);
        self.index += 1;
    }

    fn undo(&mut self) {
        web_sys::console::log_2(&"Undo with state {}".into(), &self.index.into());
        if self.index >= 1 {
            self.index -= 1;
        }
    }

    fn redo(&mut self) {
        if self.index < self.queue.len() - 1 {
            self.index += 1;
        }
    }
}

#[wasm_bindgen]
#[derive(Clone)]
struct InternalState {
    undo_queue: UndoQueue<Image>,
}

#[wasm_bindgen]
impl InternalState {
    pub fn new(width: usize, height: usize) -> Self {
        InternalState {
            undo_queue: UndoQueue::new(Image::new(width, height)),
        }
    }

    pub fn copy(&self) -> Self {
        InternalState {
            undo_queue: self.undo_queue.clone(),
        }
    }

    pub fn image(&self) -> Image {
        self.undo_queue.current()
    }

    pub fn brush(&mut self, width: usize, height: usize, color: Vec<u8>) {
        if let Some(img) = self.image().brush(width, height, color) {
            self.undo_queue.push(img);
        }
    }

    pub fn undo(&mut self) {
        self.undo_queue.undo();
    }

    pub fn redo(&mut self) {
        self.undo_queue.redo();
    }
}
