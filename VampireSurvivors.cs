using System;
using System.Collections.Generic;
using ConnectorLib;
using CrowdControl.Common;
using CrowdControl.Games.Packs;
using ConnectorType = CrowdControl.Common.ConnectorType;

public class VampireSurvivors : SimpleTCPPack<SimpleWebsocketServerConnector>
{
    public override string Host { get; } = "0.0.0.0";

    public override ushort Port { get; } = 43384;

    public VampireSurvivors(IPlayer player, Func<CrowdControlBlock, bool> responseHandler, Action<object> statusUpdateHandler) : base(player, responseHandler, statusUpdateHandler) { }

    public override Game Game { get; } = new Game(90, "Vampire Survivors Randomizer", "VampireSurvivors", "PC", ConnectorType.SimpleWebsocketServerConnector);

    public override List<Effect> Effects => new List<Effect>
    {
        //General Effects
        new Effect("Toggle Invulnerability", "toggle_invulnerable"),
        new Effect("Normal Speed", "normal_speed"),
        new Effect("Super Speed", "super_speed"),
        new Effect("Empty Pools", "empty_pools"),
        new Effect("Freeze Enemies", "freeze_enemies"),
        new Effect("Fast Enemies", "fast_enemies"),
        new Effect("Walking Enemies", "walking_enemies"),
        new Effect("Slow Enemies", "slow_enemies"),
        new Effect("Giant Enemies", "giant_enemies"),
        new Effect("Normal Enemies", "normal_enemies"),
        new Effect("Tiny Enemies", "tiny_enemies"),
        new Effect("Toggle Names", "toggle_names"),

        //Enemies
        new Effect("Spawn Enemy", "spawn_enemy", ItemKind.Folder),
        new Effect("Small Pipestrello", "spawn_bat1", "spawn_enemy"),
        new Effect("Pipestrello", "spawn_bat2", "spawn_enemy"),
        new Effect("Big Pipestrello", "spawn_bat3", "spawn_enemy"),
        new Effect("Milk Elemental", "spawn_milk", "spawn_enemy"),

        //Bosses
        new Effect("Spawn Boss", "spawn_boss", ItemKind.Folder),
        new Effect("Trickster", "spawn_boss_trickster_normal", "spawn_boss"),
        new Effect("Drowner", "spawn_boss_drowner_normal", "spawn_boss"),
        new Effect("Stalker", "spawn_boss_stalker_normal", "spawn_boss"),
        
        //Basic Weapons
        new Effect("Give Weapon", "give_weapon", new[]{"item"}),
        new Effect("Remove Weapon", "remove_weapon", new[]{"item"}),
        new Effect("Whip", $"whip", ItemKind.Usable, "item"),
        new Effect("Magic Wand", $"magic_missile", ItemKind.Usable, "item"),
        new Effect("Knife", $"knife", ItemKind.Usable, "item"),
        new Effect("Axe", $"axe", ItemKind.Usable, "item"),
        new Effect("Cross", $"cross", ItemKind.Usable, "item"),
        new Effect("Fire Wand", $"fireball", ItemKind.Usable, "item"),
        new Effect("King Bible", $"holybook", ItemKind.Usable, "item"),
        new Effect("Garlic", $"garlic", ItemKind.Usable, "item"),
        new Effect("Santa Water", $"holywater", ItemKind.Usable, "item"),
        new Effect("Runetracer", $"diamond", ItemKind.Usable, "item"),
        new Effect("Lightning Ring", $"lightning", ItemKind.Usable, "item"),
        new Effect("Pentagram", $"pentagram", ItemKind.Usable, "item"),
        new Effect("Peachone", $"silf", ItemKind.Usable, "item"),
        new Effect("Ebony Wings", $"silf2", ItemKind.Usable, "item"),
        new Effect("Eight The Sparrow", $"guns2", ItemKind.Usable, "item"),
        new Effect("Phiera Der Tuphello", $"guns", ItemKind.Usable, "item"),
        new Effect("Gatti Amari", $"gatti", ItemKind.Usable, "item"),
        new Effect("Song of Mana", $"song", ItemKind.Usable, "item"),
        new Effect("Shadow Pinion", $"trapano", ItemKind.Usable, "item"),
        new Effect("Clock Lancet", $"lancet", ItemKind.Usable, "item"),
        new Effect("Laurel", $"laurel", ItemKind.Usable, "item"),
        new Effect("Vento Sacro", $"vento", ItemKind.Usable, "item"),
        new Effect("Bone", $"bone", ItemKind.Usable, "item"),
        new Effect("Cherry Bomb", $"cherry", ItemKind.Usable, "item"),
        new Effect("Carréllo", $"cart2", ItemKind.Usable, "item"),
        new Effect("Celestial Dusting", $"flower", ItemKind.Usable, "item"),
        new Effect("La Robba", $"robba", ItemKind.Usable, "item"),
        new Effect("Candybox", $"candybox", ItemKind.Usable, "item"),
        new Effect("Bracelet", $"triasso1", ItemKind.Usable, "item"),
        new Effect("Victory Sword", $"victory", ItemKind.Usable, "item"),

        //Evolved Weapons
        new Effect("Give Evolved Weapon", "give_evo_weapon", new[]{"evoitem"}),
        new Effect("Remove Evolved Weapon", "remove_evo_weapon", new[]{"evoitem"}),
        new Effect("Bloody Tear", $"vampirica", ItemKind.Usable, "evoitem"),
        new Effect("Holy Wand", $"holy_missile", ItemKind.Usable, "evoitem"),
        new Effect("Thousand Edge", $"thousand", ItemKind.Usable, "evoitem"),
        new Effect("Death Spiral", $"scythe", ItemKind.Usable, "evoitem"),
        new Effect("Heaven Sword", $"heavensword", ItemKind.Usable, "evoitem"),
        new Effect("Unholy Vespers", $"vespers", ItemKind.Usable, "evoitem"),
        new Effect("Hellfire", $"hellfire", ItemKind.Usable, "evoitem"),
        new Effect("Soul Eater", $"vortex", ItemKind.Usable, "evoitem"),
        new Effect("La Borra", $"bora", ItemKind.Usable, "evoitem"),
        new Effect("NO FUTURE", $"rocher", ItemKind.Usable, "evoitem"),
        new Effect("Thunder Loop", $"loop", ItemKind.Usable, "evoitem"),
        new Effect("Gorgeous Moon", $"sire", ItemKind.Usable, "evoitem"),
        new Effect("Vandalier", $"silf3", ItemKind.Usable, "evoitem"),
        new Effect("Phieraggi", $"guns3", ItemKind.Usable, "evoitem"),
        new Effect("Vicious Hunger", $"stigrangatti", ItemKind.Usable, "evoitem"),
        new Effect("Mannajja", $"mannaggia", ItemKind.Usable, "evoitem"),
        new Effect("Valkyrie Turner", $"trapano2", ItemKind.Usable, "evoitem"),
        new Effect("Infinite Corridor", $"corridor", ItemKind.Usable, "evoitem"),
        new Effect("Crimson Shroud", $"shroud", ItemKind.Usable, "evoitem"),
        new Effect("Fuwalafuwaloo", $"vento2", ItemKind.Usable, "evoitem"),
        new Effect("Bi-Bracelet", $"triasso2", ItemKind.Usable, "evoitem"),
        new Effect("Tri-Bracelet", $"triasso3", ItemKind.Usable, "evoitem"),
        new Effect("Sole Solution", $"soles", ItemKind.Usable, "evoitem"),

        //Accessories
        new Effect("Give Accessory", "give_accessory", new[]{"accessory"}),
        new Effect("Remove Accessory", "remove_accessory", new[]{"accessory"}),
        new Effect("Spinach", $"power", ItemKind.Usable, "accessory"),
        new Effect("Armor", $"armor", ItemKind.Usable, "accessory"),
        new Effect("Hollow Heart", $"maxhealth", ItemKind.Usable, "accessory"),
        new Effect("Pummarola", $"regen", ItemKind.Usable, "accessory"),
        new Effect("Empty Tome", $"cooldown", ItemKind.Usable, "accessory"),
        new Effect("Candelabrador", $"area", ItemKind.Usable, "accessory"),
        new Effect("Bracer", $"speed", ItemKind.Usable, "accessory"),
        new Effect("Spellbinder", $"duration", ItemKind.Usable, "accessory"),
        new Effect("Duplicator", $"amount", ItemKind.Usable, "accessory"),
        new Effect("Wings", $"movespeed", ItemKind.Usable, "accessory"),
        new Effect("Attractorb", $"magnet", ItemKind.Usable, "accessory"),
        new Effect("Clover", $"luck", ItemKind.Usable, "accessory"),
        new Effect("Crown", $"growth", ItemKind.Usable, "accessory"),
        new Effect("Stone Mask", $"greed", ItemKind.Usable, "accessory"),
        new Effect("Skull O'Maniac", $"curse", ItemKind.Usable, "accessory"),
        new Effect("Tiragisú", $"revival", ItemKind.Usable, "accessory"),
        new Effect("Torrona's Box", $"pandora", ItemKind.Usable, "accessory"),
        new Effect("Silver Ring", $"silver", ItemKind.Usable, "accessory"),
        new Effect("Gold Ring", $"gold", ItemKind.Usable, "accessory"),
        new Effect("Metaglio Left", $"left", ItemKind.Usable, "accessory"),
        new Effect("Metaglio Right", $"right", ItemKind.Usable, "accessory"),

        //Disabled - these effects are typically from hidden weapons, level-specific effects, or randomazzio effects
        // new Effect("Cygnus", $"silf_counter", ItemKind.Usable, "item"),
        // new Effect("Zhar Ptytsia", $"silf2_COUNTER", ItemKind.Usable, "item"),
        // new Effect("Red Muscle", $"guns_counter", ItemKind.Usable, "item"),
        // new Effect("Twice Upon a Time", $"guns2_COUNTER", ItemKind.Usable, "item"),
        // new Effect("Flock Destroyer", $"gatti_counter", ItemKind.Usable, "item"),
        // new Effect("Nduja Fritta", $"nduja", ItemKind.Usable, "item"),
        // new Effect("Nduja Fritta", $"nduja_counter", ItemKind.Usable, "item"),
        // new Effect("Dairy Cart", $"cart", ItemKind.Usable, "item"),
        // new Effect("Sarabande of Healing", $"sarabande", ItemKind.Usable, "item"),
        // new Effect("Stained Glass", $"window", ItemKind.Usable, "item"),
        // new Effect("Game Killer", $"window2", ItemKind.Usable, "item"),
        // new Effect("Heart of Fire", $"fireexplosion", ItemKind.Usable, "item"),
        // new Effect("Out of Bounds", $"coldexplosion", ItemKind.Usable, "item"),
        // new Effect("Divine Bloodline", $"bloodline", ItemKind.Usable, "item"),

    };
    public override List<ItemType> ItemTypes => new(new[]
    {
        new ItemType("Basic Weapon", "item", ItemType.Subtype.ItemList),
        new ItemType("Evolved Weapon", "evoitem", ItemType.Subtype.ItemList),
        new ItemType("Accessory", "accessory", ItemType.Subtype.ItemList)
        // new ItemType("Quantity", "quantity99", ItemType.Subtype.Slider, "{\"min\":1,\"max\":99}"),
    });
}