//! This module is used to store stuff from Rust's AST in a more convenient
//! manner (and with prettier names) before cleaning.
use rustc_span::{self, Span, Symbol};

use rustc_hir as hir;

pub(crate) struct Module<'hir> {
    pub(crate) name: Option<Symbol>,
    pub(crate) where_outer: Span,
    pub(crate) where_inner: Span,
    pub(crate) mods: Vec<Module<'hir>>,
    pub(crate) id: hir::HirId,
    // (item, renamed)
    pub(crate) items: Vec<(&'hir hir::Item<'hir>, Option<Symbol>)>,
    pub(crate) foreigns: Vec<(&'hir hir::ForeignItem<'hir>, Option<Symbol>)>,
    pub(crate) macros: Vec<(&'hir hir::MacroDef<'hir>, Option<Symbol>)>,
    pub(crate) is_crate: bool,
}

impl Module<'hir> {
    pub(crate) fn new(name: Option<Symbol>) -> Module<'hir> {
        Module {
            name,
            id: hir::CRATE_HIR_ID,
            where_outer: rustc_span::DUMMY_SP,
            where_inner: rustc_span::DUMMY_SP,
            mods: Vec::new(),
            items: Vec::new(),
            foreigns: Vec::new(),
            macros: Vec::new(),
            is_crate: false,
        }
    }
}
