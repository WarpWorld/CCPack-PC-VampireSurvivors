using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using ConnectorLib.SimpleTCP;
using CrowdControl.Common;

namespace CrowdControl.Games.Packs
{
    [SuppressMessage("ReSharper", "CommentTypo")]
    [SuppressMessage("ReSharper", "StringLiteralTypo")]
    public class VampireSurvivors : SimpleTCPPack<SimpleWebsocketServerConnector>
    {
        public override string Host => "0.0.0.0";

        public override ushort Port => 43384;

        public VampireSurvivors(IPlayer player, Func<CrowdControlBlock, bool> responseHandler, Action<object> statusUpdateHandler) : base(player, responseHandler, statusUpdateHandler) { }

        public override Game Game { get; } = new(174, "Vampire Survivors", "VampireSurvivors", "PC", ConnectorType.SimpleWebsocketServerConnector);

        public override List<Effect> Effects => new()
        {
            //General Effects
            new("Toggle Invulnerability", "toggle_invulnerable"),
            new("Normal Speed", "normal_speed"),
            new("Super Speed", "super_speed"),
            new("Empty Pools", "empty_pools"),
            new("Freeze Enemies", "freeze_enemies"),
            new("Fast Enemies", "fast_enemies"),
            new("Walking Enemies", "walking_enemies"),
            new("Slow Enemies", "slow_enemies"),
            new("Giant Enemies", "giant_enemies"),
            new("Normal Enemies", "normal_enemies"),
            new("Tiny Enemies", "tiny_enemies"),
            new("Toggle Names", "toggle_names"),

            //Enemies
            new("Spawn Enemy", "spawn_enemy", ItemKind.Folder),
            new("Small Pipestrello", "spawn_bat1", "spawn_enemy"),
            new("Pipestrello", "spawn_bat2", "spawn_enemy"),
            new("Big Pipestrello", "spawn_bat3", "spawn_enemy"),
            new("Milk Elemental", "spawn_milk", "spawn_enemy"),

            //Bosses
            new("Spawn Boss", "spawn_boss", ItemKind.Folder),
            new("Trickster", "spawn_boss_trickster_normal", "spawn_boss"),
            new("Drowner", "spawn_boss_drowner_normal", "spawn_boss"),
            new("Stalker", "spawn_boss_stalker_normal", "spawn_boss"),
        
            //Basic Weapons
            new("Give Weapon", "give_weapon", new[]{"item"}),
            new("Remove Weapon", "remove_weapon", new[]{"item"}),
            new("Whip", "whip", ItemKind.Usable, "item"),
            new("Magic Wand", "magic_missile", ItemKind.Usable, "item"),
            new("Knife", "knife", ItemKind.Usable, "item"),
            new("Axe", "axe", ItemKind.Usable, "item"),
            new("Cross", "cross", ItemKind.Usable, "item"),
            new("Fire Wand", "fireball", ItemKind.Usable, "item"),
            new("King Bible", "holybook", ItemKind.Usable, "item"),
            new("Garlic", "garlic", ItemKind.Usable, "item"),
            new("Santa Water", "holywater", ItemKind.Usable, "item"),
            new("Runetracer", "diamond", ItemKind.Usable, "item"),
            new("Lightning Ring", "lightning", ItemKind.Usable, "item"),
            new("Pentagram", "pentagram", ItemKind.Usable, "item"),
            new("Peachone", "silf", ItemKind.Usable, "item"),
            new("Ebony Wings", "silf2", ItemKind.Usable, "item"),
            new("Eight The Sparrow", "guns2", ItemKind.Usable, "item"),
            new("Phiera Der Tuphello", "guns", ItemKind.Usable, "item"),
            new("Gatti Amari", "gatti", ItemKind.Usable, "item"),
            new("Song of Mana", "song", ItemKind.Usable, "item"),
            new("Shadow Pinion", "trapano", ItemKind.Usable, "item"),
            new("Clock Lancet", "lancet", ItemKind.Usable, "item"),
            new("Laurel", "laurel", ItemKind.Usable, "item"),
            new("Vento Sacro", "vento", ItemKind.Usable, "item"),
            new("Bone", "bone", ItemKind.Usable, "item"),
            new("Cherry Bomb", "cherry", ItemKind.Usable, "item"),
            new("Carréllo", "cart2", ItemKind.Usable, "item"),
            new("Celestial Dusting", "flower", ItemKind.Usable, "item"),
            new("La Robba", "robba", ItemKind.Usable, "item"),
            new("Candybox", "candybox", ItemKind.Usable, "item"),
            new("Bracelet", "triasso1", ItemKind.Usable, "item"),
            new("Victory Sword", "victory", ItemKind.Usable, "item"),

            //Evolved Weapons
            new("Give Evolved Weapon", "give_evo_weapon", new[]{"evoitem"}),
            new("Remove Evolved Weapon", "remove_evo_weapon", new[]{"evoitem"}),
            new("Bloody Tear", "vampirica", ItemKind.Usable, "evoitem"),
            new("Holy Wand", "holy_missile", ItemKind.Usable, "evoitem"),
            new("Thousand Edge", "thousand", ItemKind.Usable, "evoitem"),
            new("Death Spiral", "scythe", ItemKind.Usable, "evoitem"),
            new("Heaven Sword", "heavensword", ItemKind.Usable, "evoitem"),
            new("Unholy Vespers", "vespers", ItemKind.Usable, "evoitem"),
            new("Hellfire", "hellfire", ItemKind.Usable, "evoitem"),
            new("Soul Eater", "vortex", ItemKind.Usable, "evoitem"),
            new("La Borra", "bora", ItemKind.Usable, "evoitem"),
            new("NO FUTURE", "rocher", ItemKind.Usable, "evoitem"),
            new("Thunder Loop", "loop", ItemKind.Usable, "evoitem"),
            new("Gorgeous Moon", "sire", ItemKind.Usable, "evoitem"),
            new("Vandalier", "silf3", ItemKind.Usable, "evoitem"),
            new("Phieraggi", "guns3", ItemKind.Usable, "evoitem"),
            new("Vicious Hunger", "stigrangatti", ItemKind.Usable, "evoitem"),
            new("Mannajja", "mannaggia", ItemKind.Usable, "evoitem"),
            new("Valkyrie Turner", "trapano2", ItemKind.Usable, "evoitem"),
            new("Infinite Corridor", "corridor", ItemKind.Usable, "evoitem"),
            new("Crimson Shroud", "shroud", ItemKind.Usable, "evoitem"),
            new("Fuwalafuwaloo", "vento2", ItemKind.Usable, "evoitem"),
            new("Bi-Bracelet", "triasso2", ItemKind.Usable, "evoitem"),
            new("Tri-Bracelet", "triasso3", ItemKind.Usable, "evoitem"),
            new("Sole Solution", "soles", ItemKind.Usable, "evoitem"),

            //Accessories
            new("Give Accessory", "give_accessory", new[]{"accessory"}),
            new("Remove Accessory", "remove_accessory", new[]{"accessory"}),
            new("Spinach", "power", ItemKind.Usable, "accessory"),
            new("Armor", "armor", ItemKind.Usable, "accessory"),
            new("Hollow Heart", "maxhealth", ItemKind.Usable, "accessory"),
            new("Pummarola", "regen", ItemKind.Usable, "accessory"),
            new("Empty Tome", "cooldown", ItemKind.Usable, "accessory"),
            new("Candelabrador", "area", ItemKind.Usable, "accessory"),
            new("Bracer", "speed", ItemKind.Usable, "accessory"),
            new("Spellbinder", "duration", ItemKind.Usable, "accessory"),
            new("Duplicator", "amount", ItemKind.Usable, "accessory"),
            new("Wings", "movespeed", ItemKind.Usable, "accessory"),
            new("Attractorb", "magnet", ItemKind.Usable, "accessory"),
            new("Clover", "luck", ItemKind.Usable, "accessory"),
            new("Crown", "growth", ItemKind.Usable, "accessory"),
            new("Stone Mask", "greed", ItemKind.Usable, "accessory"),
            new("Skull O'Maniac", "curse", ItemKind.Usable, "accessory"),
            new("Tiragisú", "revival", ItemKind.Usable, "accessory"),
            new("Torrona's Box", "pandora", ItemKind.Usable, "accessory"),
            new("Silver Ring", "silver", ItemKind.Usable, "accessory"),
            new("Gold Ring", "gold", ItemKind.Usable, "accessory"),
            new("Metaglio Left", "left", ItemKind.Usable, "accessory"),
            new("Metaglio Right", "right", ItemKind.Usable, "accessory"),

            //Disabled - these effects are typically from hidden weapons, level-specific effects, or randomazzio effects
            // new("Cygnus", $"silf_counter", ItemKind.Usable, "item"),
            // new("Zhar Ptytsia", $"silf2_COUNTER", ItemKind.Usable, "item"),
            // new("Red Muscle", $"guns_counter", ItemKind.Usable, "item"),
            // new("Twice Upon a Time", $"guns2_COUNTER", ItemKind.Usable, "item"),
            // new("Flock Destroyer", $"gatti_counter", ItemKind.Usable, "item"),
            // new("Nduja Fritta", $"nduja", ItemKind.Usable, "item"),
            // new("Nduja Fritta", $"nduja_counter", ItemKind.Usable, "item"),
            // new("Dairy Cart", $"cart", ItemKind.Usable, "item"),
            // new("Sarabande of Healing", $"sarabande", ItemKind.Usable, "item"),
            // new("Stained Glass", $"window", ItemKind.Usable, "item"),
            // new("Game Killer", $"window2", ItemKind.Usable, "item"),
            // new("Heart of Fire", $"fireexplosion", ItemKind.Usable, "item"),
            // new("Out of Bounds", $"coldexplosion", ItemKind.Usable, "item"),
            // new("Divine Bloodline", $"bloodline", ItemKind.Usable, "item")
        };

        public override List<ItemType> ItemTypes => new()
        {
            new("Basic Weapon", "item", ItemType.Subtype.ItemList),
            new("Evolved Weapon", "evoitem", ItemType.Subtype.ItemList),
            new("Accessory", "accessory", ItemType.Subtype.ItemList)
        };
    }
}