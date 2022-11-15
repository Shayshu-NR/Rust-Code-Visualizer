pub(crate) mod cache;
pub(crate) mod item_type;
pub(crate) mod renderer;

pub(crate) use renderer::{run_format, FormatRenderer};

use rustc_span::def_id::DefId;

use crate::clean;
use crate::clean::types::GetDefId;
use crate::formats::cache::Cache;

/// Specifies whether rendering directly implemented trait items or ones from a certain Deref
/// impl.
pub(crate) enum AssocItemRender<'a> {
    All,
    DerefFor { trait_: &'a clean::Type, type_: &'a clean::Type, deref_mut_: bool },
}

/// For different handling of associated items from the Deref target of a type rather than the type
/// itself.
#[derive(Copy, Clone, PartialEq)]
pub(crate) enum RenderMode {
    Normal,
    ForDeref { mut_: bool },
}

/// Metadata about implementations for a type or trait.
#[derive(Clone, Debug)]
pub(crate) struct Impl {
    pub(crate) impl_item: clean::Item,
}

impl Impl {
    pub(crate) fn inner_impl(&self) -> &clean::Impl {
        match *self.impl_item.kind {
            clean::ImplItem(ref impl_) => impl_,
            _ => panic!("non-impl item found in impl"),
        }
    }

    pub(crate) fn trait_did(&self) -> Option<DefId> {
        self.inner_impl().trait_.def_id()
    }

    pub(crate) fn trait_did_full(&self, cache: &Cache) -> Option<DefId> {
        self.inner_impl().trait_.def_id_full(cache)
    }
}
